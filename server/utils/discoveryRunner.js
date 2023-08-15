const discoverySet = require('./discoverySet');
const personaQueryBuilder = require('./personaQueryBuilder');
const { database } = require('./database');

const testQuery = {
  control: [
    {
      type: "filterField",
      name: "type", 
      value: "account", 
      not: false, 
      operator: "=",
    },
    {
      type: "filterControl",
      direction: "control",
      relationship: ["superadmin"],
      subset: [
        {
          type: "filterField",
          name: "platform", 
          value: "github", 
          not: false, 
          operator: "=",
        },
        {
          type: "filterField",
          name: "type", 
          value: "organization", 
          not: false, 
          operator: "=",
        },
      ],
    },
  ],
  match: [
    {
      type: "filterMatch",
      match: "in",
      subset: [
        {
          type: "filterField",
          name: "platform", 
          value: "github", 
          not: false, 
          operator: "=",
        },
        {
          type: "filterField",
          name: "type",
          value: "organization",
          not: false,
          operator: "=",
        }
      ],
    },
  ],
  nested: [
    {
      type: "filterField",
      name: "type", 
      value: "account", 
      not: false, 
      operator: "=",
    },
    {
      type: "filterField",
      name: "platform",
      value: "github",
      not: false,
      operator: "=",
    },
    {
      type: "filterControl",
      direction: "control",
      relationship: ["superadmin", "admin", "user"],
      subset: [
        {
          type: "filterField",
          name: "platform", 
          value: "github", 
          not: false, 
          operator: "=",
        },
        {
          type: "filterField",
          name: "type", 
          value: "account", 
          not: false, 
          operator: "=",
        },
        {
          type: "filterControl",
          direction: "control",
          relationship: ["superadmin"],
          subset: [
            {
              type: "filterField",
              name: "platform",
              value: "github",
              not: false,
              operator: "=",
            },
            {
              type: "filterField",
              name: "type",
              value: "organization",
              not: false,
              operator: "=",
            },
          ],
        },
      ],
    },
  ]
}

const runQueryArray = async (query, page, pageSize) => {
  const queryUpns = await getQueryArrayUpns(query);
  return await getNodesFromUpns(queryUpns, page, pageSize);
}

const getQueryArrayUpns = async (query = []) => {

  // consolidate filter types
  const fieldQueryArray = [];
  const controlQueryArray = [];
  const matchQueryArray = [];

  let upnResults = await getAllUpns();

  for(let i in query){
    let filter = query[i];
    switch(filter.type){
      case "filterField":
        fieldQueryArray.push(filter);
        break;
      case "filterControl":
        controlQueryArray.push(filter);
        break;
      case "filterMatch":
        matchQueryArray.push(filter);
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

    let fieldName = filter.name;
    let fieldValue = filter.value;
    let modifier = filter.not ? "NOT " : "";
    let operator = filter.operator;
    let node = "n";
    let nodeAgent = "nAgent";
    let nodeAllAliases = "nAllAliases";
  
    switch(operator){
      case "=":
      case ">":
      case "<":
      case ">=":
      case "<=":
        break;
      case "contains":
        operator = "CONTAINS";
        break;
      case "startsWith":
        operator = "STARTS WITH";
        break;
      case "endsWith":
        operator = "ENDS WITH";
        break;
      case "≠":
        operator = "<>";
        break;
      default:
        operator = "="; 
        break;
    }
  
    let personasToFilterOn = nodeAllAliases;

    switch(fieldName){
      case "id":
        personasToFilterOn = node;
        break;
      case "status": 
        personasToFilterOn = nodeAgent;
        break;
      case "platform":
      case "type":
      case "friendlyName":
      default:
        personasToFilterOn = nodeAllAliases;
    }
  
    queryString += `${modifier}${personasToFilterOn}.${fieldName} ${operator} "${fieldValue}"\n`;
  }
  queryString += `RETURN COLLECT(DISTINCT nAgent.upn)\n`;

  const response = getUpnsFromQuery(queryString);
  return response;
}

const getControlQueryUpns = async (controlFilter, rootUpns) => {
  if(rootUpns.length === 0){
    rootUpns = await getQueryArrayUpns();
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

const getMatchQueryUpns = async (matchFilter, upnResults) => {
}

const getMatchInQueryUpns = async (rootUpns, compareUpns) => {
  // return matchInQuery
}

const getMatchNotInQueryUpns = async (rootUpns, compareUpns) => {
  // return matchNotInQuery
}

const getNotObeyQueryUpns = async (rootUpns, compareUpns) => {
  // return notObeyQuery
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
}