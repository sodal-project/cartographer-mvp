const { personaQueryBuilder } = require('../utils/personaQueryBuilder');

const getFilterQuery = (query, parentName = "", sequence = 1) => {

  let personaName = getNodeName(parentName, sequence);
  sequence = 1;

  let queryString = `\n${getAgentQuery(personaName)}`;
  let queryTailString = ``;

  for(let i in query){
    let filter = query[i];
    switch(filter.type){
      case "filterField":
        queryString += getFilterFieldQuery(filter, personaName);
        break;
      case "filterControl":
        queryTailString += getFilterControlQuery(filter, personaName, sequence);
        break;
      case "filterMatch":
        queryTailString += getFilterMatchQuery(filter, personaName, sequence);
        break;
      case "filterSet":
        queryTailString += getFilterSetQuery(filter, personaName, sequence);
        break;
      default:
        break;
    }
    sequence++;
  }

  queryString += queryTailString;

  if(personaName == getNodeName("", 1)){
    let agentName = getAgentName(personaName);
    queryString += `\nRETURN ${agentName}`;
  }

  return queryString;
}

const getFilterFieldQuery = (filter, parentName) => {
  let queryString = `  AND `;

  let fieldName = filter.name;
  let fieldValue = filter.value;
  let modifier = filter.not ? "NOT " : "";
  let compareType = filter.compareType;

  switch(compareType){
    case "CONTAINS":
    case "STARTS WITH":
    case "ENDS WITH":
    case "=":
    case ">":
    case "<":
    case ">=":
    case "<=":
      queryString += `${modifier} ${parentName}.${fieldName} ${compareType} "${fieldValue}"\n`;
      break;
    default:
      break;
  }
  return queryString;
}

const getFilterControlQuery = (filter, parentName, sequence) => {

  let queryString = getFilterQuery(filter.subset, parentName, sequence);

  let personaName = getNodeName(parentName, sequence);

  let allParentName = getAllPersonasName(parentName);
  let allPersonaName = getAllPersonasName(personaName);

  let rel = filter.rel;
  let controlMatchString = personaQueryBuilder.getControlMatchString(rel);

  let direction = filter.direction;
  let leadDir = "-";
  let trailDir = "->";
  if(direction === "OBEY"){
    leadDir = "<-";
    trailDir = "-";
  }

  queryString += `\nMATCH (${allParentName})${leadDir}[${controlMatchString}|ALIAS_OF|HAS_ALIAS *1..]${trailDir}(${allPersonaName})\n`;

  return queryString;
}

const getFilterMatchQuery = (filter, parentName, sequence) => {
  let queryString = getFilterQuery(filter.subset, parentName, sequence);

  let personaName = getNodeName(parentName, sequence);

  let parentAgent = getAgentName(parentName);
  let personaAgent = getAgentName(personaName);

  queryString += `\nMATCH (${parentAgent}), (${personaAgent}) WHERE ${parentAgent}.upn = ${personaAgent}.upn\n`;

  return queryString;
}

const getFilterSetQuery = (filter) => { 
}

const getNodeName = (parentName, sequence) => {
  if(parentName == ""){
    return "n";
  }
  let sequenceString = String(sequence).padStart(2, '0');
  return parentName + sequenceString;
}

const getAgentName = (personaName) => {
  return personaName + "Agent";
}

const getAllPersonasName = (personaName) => {
  return personaName + "AllPersonas";
}

const getAgentQuery = (personaName) => {
  const agentName = getAgentName(personaName);
  const allPersonasName = getAllPersonasName(personaName);

  queryString = `MATCH (${personaName})-[:ALIAS_OF|HAS_ALIAS *0..2]->(${agentName})-[:HAS_ALIAS *0..1]->(${allPersonasName})\nWHERE NOT (${agentName})-[:ALIAS_OF]->()\n`;
  
  return queryString;
}

const filterQueryBuilder = {
  getFilterQuery,
}

module.exports = { filterQueryBuilder };