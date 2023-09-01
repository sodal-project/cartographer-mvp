const personaQueryBuilder = require('./personaQueryBuilder');
const discoverySetModel = require('../models/discoverySetModel');
const { database } = require('./database');

const runQueryArray = async (query, page, pageSize) => {
  const queryUpns = await getQueryArrayUpns(query);
  return await getNodesFromUpns(queryUpns, page, pageSize);
}

const getQueryArrayUpns = async (query = []) => {

  // consolidate filter types
  const fieldQueryArray = [];
  const controlQueryArray = [];
  const matchQueryArray = [];
  const setQueryArray = [];

  let upnResults = await getAllUpns();

  for(let i in query){
    let filter = query[i];
    switch(filter.type){
      case "filterField":
      case "field":
        fieldQueryArray.push(filter);
        break;
      case "control":
      case "filterControl":
        controlQueryArray.push(filter);
        break;
      case "match":
      case "filterMatch":
        matchQueryArray.push(filter);
        break;
      case "set":
      case "filterSet":
        setQueryArray.push(filter);
        break;
      default:
        break;
    }
  }

  // process field filters
  if(fieldQueryArray.length > 0){
    const fieldQueryUpns = await getFieldQueryArrayUpns(fieldQueryArray);
    upnResults = fieldQueryUpns;
  }

  // process set fields
  if(setQueryArray.length > 0){
    for(let i in setQueryArray){
      const setQuery = setQueryArray[i];
      setQuery.direction = "in";
      const set = await discoverySetModel.getSet(setQuery.setid);
      setQuery.subset = set.subset;
      matchQueryArray.push(setQuery);
    }
  }

  // process match fields
  if(matchQueryArray.length > 0){
    for(let i in matchQueryArray){
      let matchQuery = matchQueryArray[i];
      upnResults = await getMatchQueryUpns(matchQuery, upnResults);
    }
  }

  // process control fields with fewest possible initial upns
  if(controlQueryArray.length > 0){
    for(let i in controlQueryArray){
      let controlQuery = controlQueryArray[i];
      upnResults = await getControlQueryUpns(controlQuery, upnResults);
    }
  }

  return upnResults;
}

const getFieldQueryArrayUpns = async (fieldQueryArray) => {

  let queryString = getMatchString();

  for(let i in fieldQueryArray){
    let filter = fieldQueryArray[i];

    queryString += `AND `;

    const fieldName = filter.name;
    const fieldValue = filter.value;
    const modifier = filter.not ? "NOT " : "";
  
    const operators = {
      "=": "=",
      ">": ">",
      "<": "<",
      ">=": ">=",
      "≠": "<>",
      "contains": "CONTAINS",
      "startsWith": "STARTS WITH",
      "endsWith": "ENDS WITH",
    }
    const operator = operators[filter.operator]
  
    let personasToFilterOn = "";
    switch(fieldName){
      case "id":
        personasToFilterOn = "n";
        break;
      case "status": 
        personasToFilterOn = "nAgent";
        break;
      case "platform":
      case "type":
      case "friendlyName":
      default:
        personasToFilterOn = "nAllAliases";
    }
  
    queryString += `${modifier}${personasToFilterOn}.${fieldName} ${operator} "${fieldValue}"\n`;
  }
  queryString += `RETURN COLLECT(DISTINCT nAgent.upn)\n`;

  const response = getUpnsFromQuery(queryString);
  return response;
}

const getControlQueryUpns = async (controlFilter, rootUpns) => {
  if(rootUpns.length === 0){
    return [];
  }

  const compareUpns = await getQueryArrayUpns(controlFilter.subset);

  const direction = controlFilter.direction;
  const relationships = controlFilter.relationships;

  let controlMatchString = personaQueryBuilder.getControlMatchString(relationships);

  queryString = "";
  
  queryString = `MATCH (controlAgent)-[:HAS_ALIAS *0..1]->()-[${controlMatchString}|ALIAS_OF *1..]->(obeyAllAliases)-[:ALIAS_OF *0..1]->(obeyAgent)
  WHERE NOT (controlAgent)-[:ALIAS_OF]->()
  AND NOT (obeyAgent)-[:ALIAS_OF]->()
  `;

  switch(direction){
    case "control":
      queryString += `AND controlAgent.upn IN $rootUpns \n  AND obeyAgent.upn IN $compareUpns\n`;
      queryString += `RETURN COLLECT(DISTINCT controlAgent.upn)\n`;
      break;
    case "notcontrol":
      queryString += `AND controlAgent.upn IN $rootUpns\n  AND obeyAgent.upn IN $compareUpns\n`;
      queryString += `WITH COLLECT(DISTINCT controlAgent.upn) AS controlUpns\n`;
      queryString += `MATCH (notControlledAgent) WHERE notControlledAgent.upn IN $rootUpns AND NOT notControlledAgent.upn IN controlUpns\n`;
      queryString += `RETURN COLLECT(DISTINCT notControlledAgent.upn)\n`;
      break;
    case "obey":
      queryString += `AND controlAgent.upn IN $compareUpns \n  AND obeyAgent.upn IN $rootUpns\n`;
      queryString += `RETURN COLLECT(DISTINCT obeyAgent.upn)\n`;
      break;
    case "notobey":
      queryString += `AND controlAgent.upn IN $compareUpns \n  AND obeyAgent.upn IN $rootUpns\n`;
      queryString += `WITH COLLECT(DISTINCT obeyAgent.upn) AS obeyUpns\n`;
      queryString += `MATCH (notObeyingAgent) WHERE notObeyingAgent.upn IN $rootUpns AND NOT notObeyingAgent.upn IN obeyUpns\n`;
      queryString += `RETURN COLLECT(DISTINCT notObeyingAgent.upn)\n`;
      break;
  }
  return await getUpnsFromQuery(queryString, {rootUpns: rootUpns, compareUpns: compareUpns});
}

const getMatchQueryUpns = async (matchFilter, rootUpns) => {
  console.log(matchFilter);

  if(rootUpns.length === 0){
    return [];
  }

  const compareUpns = await getQueryArrayUpns(matchFilter.subset);
  const direction = matchFilter.direction;

  let queryString = `MATCH (nAgent)-[:HAS_ALIAS *0..1]->(nAllAliases)\n`;

  switch(direction){
    case "in":
      queryString += `WHERE nAgent.upn IN $rootUpns\n  AND nAgent.upn IN $compareUpns\n`;
      break;
    default:
      queryString += `WHERE nAgent.upn IN $rootUpns\n  AND NOT nAgent.upn IN $compareUpns\n`;
      break;
  }
  queryString += `RETURN COLLECT(DISTINCT nAgent.upn)\n`;

  return await getUpnsFromQuery(queryString, {rootUpns: rootUpns, compareUpns: compareUpns});
}

const getMatchString = () => {
  return `MATCH (n)-[:ALIAS_OF *0..1]->(nAgent)-[:HAS_ALIAS *0..1]->(nAllAliases)
  WHERE NOT (nAgent)-[:ALIAS_OF]->()\n`;
}

const getNodesFromUpns = async (upnArray, page, pageSize) => {

  let queryString = `MATCH (nAgent) `;
  queryString += `WHERE nAgent.upn IN ($upnArray) `;
  queryString += `RETURN DISTINCT nAgent SKIP $skip LIMIT $limit `;

  const params = {
    upnArray: upnArray,
  }

  const response = await database.dbQuery(queryString, page, pageSize, params);
  return response;
}

const getAllUpns = async () => {
  let queryString = getMatchString();
  queryString += `RETURN COLLECT(DISTINCT nAgent.upn)\n`;
  const response = await getUpnsFromQuery(queryString);
  return response;
}

const getUpnsFromQuery = async (queryString, params) => {
  const page = 1;
  const pageSize = 10000000;
  console.log("Running query string...\n", queryString);
  const result = await database.dbQuery(queryString, page, pageSize, params);
  const response = result.records.map(node => node._fields[0]);
  console.log(`Response: ${response[0].length} upns found.`)
  return response[0];
}

module.exports = {
  runQueryArray,
  getQueryArrayUpns,
}