const filterSet = require('../utils/filterSet');
const personaQueryBuilder = require('../utils/personaQueryBuilder');

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
      direction: "CONTROL",
      rel: ["superadmin"],
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
      match: "IN",
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
      direction: "CONTROL",
      rel: ["superadmin", "admin", "user"],
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
          direction: "CONTROL",
          rel: ["superadmin"],
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

const getCypherFromQueryArray = (query, parentName = "", sequence = 1) => {

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
    queryString += `\nRETURN DISTINCT ${agentName} SKIP $skip LIMIT $limit`;
  }

  return queryString;
}

const getFilterFieldQuery = (filter, parentName) => {
  let queryString = `  AND `;

  let fieldName = filter.name;
  let fieldValue = filter.value;
  let modifier = filter.not ? "NOT " : "";
  let operator = filter.operator;
  let allParent = getAllPersonasName(parentName);

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
  queryString += `${modifier}${allParent}.${fieldName} ${operator} "${fieldValue}"\n`;

  return queryString;
}

const getFilterControlQuery = (filter, parentName, sequence) => {

  let queryString = getCypherFromQueryArray(filter.subset, parentName, sequence);

  let personaName = getNodeName(parentName, sequence);

  let allParentName = getAllPersonasName(parentName);
  // let allPersonaName = getAllPersonasName(personaName);
  // let parentAgent = getAgentName(parentName);
  let personaAgent = getAgentName(personaName);

  let relationships = filter.relationships;
  let controlMatchString = personaQueryBuilder.getControlMatchString(relationships);

  let direction = filter.direction;
  let leadDir = "-";
  let trailDir = "->";
  if(direction === "obey"){
    leadDir = "<-";
    trailDir = "-";
  }

  queryString += `\nMATCH (${allParentName})${leadDir}[${controlMatchString}|ALIAS_OF *1..]${trailDir}(${personaAgent})\n`;

  return queryString;
}

const getFilterMatchQuery = (filter, parentName, sequence) => {
  let queryString = getCypherFromQueryArray(filter.subset, parentName, sequence);

  let personaName = getNodeName(parentName, sequence);

  let parentAgent = getAgentName(parentName);
  let personaAgent = getAgentName(personaName);
  let personaAgentUpnList = personaAgent + "UpnList";

  let modifer = "";
  if(filter.match === "NOT_IN"){ modifer = "NOT "; }

  queryString += `WITH COLLECT(${personaAgent}.upn) AS ${personaAgentUpnList}\n`;

  queryString += `\nMATCH (${parentAgent}) WHERE ${parentAgent}.upn ${modifer}IN ${personaAgentUpnList}\n`;

  return queryString;
}

const getFilterSetQuery = (filter, parentName, sequence) => { 
  let queryString = "";

  const setQuery = filterSet.getSet(filter.setId)
  queryString += getCypherFromQueryArray(setQuery, parentName, sequence);

  return queryString;
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

module.exports = { 
  getCypherFromQueryArray,
  testQuery,
};