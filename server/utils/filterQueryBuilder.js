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
          direction: "CONTROL",
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

const getCypherFromQueryArray = (query, parentName = "", parentSequence = 1, withString) => {

  let personaName = getNodeName(parentName, parentSequence);
  let personaAgent = getAgentName(personaName);
  let personaAgentNodes = personaAgent + "Nodes";

  let parentAgent = getAgentName(parentName);
  let sequence = 1;

  if(!withString){
    withString = "WITH ";
  } else {
    withString += `${parentAgent}, `;
  }

  let queryString = `\n${getAgentQuery(personaName)}`;
  let queryTailString = `\n`;

  for(let i in query){
    let filter = query[i];
    switch(filter.type){
      case "filterField":
        queryString += getFilterFieldQuery(filter, personaName);
        break;
      case "filterControl":
        queryTailString += getFilterControlQuery(filter, personaName, sequence, withString);
        break;
      case "filterMatch":
        queryTailString += getFilterMatchQuery(filter, personaName, sequence, withString);
        break;
      case "filterSet":
        queryTailString += getFilterSetQuery(filter, personaName, sequence, withString);
        break;
      default:
        break;
    }
    sequence++;
  }

  withString += `COLLECT(DISTINCT ${personaAgentNodes}) AS ${personaAgent}`
  queryString += withString;

  queryString += queryTailString;

  if(personaName == getNodeName("", 1)){
    queryString += `\nWITH nAgent AS tempName`;
    queryString += `\nUNWIND tempName AS nAgent\nRETURN nAgent SKIP $skip LIMIT $limit`;
  }

  return queryString;
}

const getFilterFieldQuery = (filter, parentName) => {
  let queryString = `  AND `;

  let fieldName = filter.name;
  let fieldValue = filter.value;
  let modifier = filter.not ? "NOT " : "";
  let operator = filter.operator;
  let parentAgentNodes = getAgentName(parentName) + "Nodes";
  let parentAll = getAllPersonaName(parentName);

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

  let personasToFilterOn;
  switch(fieldName){
    case "status": 
      // restrict status to the agent node
      personasToFilterOn = parentAgentNodes;
      break;
    case "id":
    case "platform":
    case "type":
    default:
      // otherwise, be permissive and accept all aliased persona values
      personasToFilterOn = parentAll;
  }

  queryString += `${modifier}${personasToFilterOn}.${fieldName} ${operator} "${fieldValue}"\n`;

  return queryString;
}

const getFilterControlQuery = (filter, parentName, sequence, withString) => {

  let queryString = getCypherFromQueryArray(filter.subset, parentName, sequence, withString);

  let personaName = getNodeName(parentName, sequence);

  let parentAgent = getAgentName(parentName);
  let personaAgent = getAgentName(personaName);

  let relationships = filter.relationships;
  let controlMatchString = personaQueryBuilder.getControlMatchString(relationships);

  let direction = filter.direction;
  let leadDir = "-";
  let trailDir = "->";
  if(direction === "obey" || direction === "notcontrol"){
    leadDir = "<-";
    trailDir = "-";
  }
  if(direction === "notobey" || direction === "notcontrol"){ 
    
    queryString += `
    UNWIND ${personaAgent} AS localAgents
    MATCH (localAgents)-[:HAS_ALIAS *0..1]->(localPersonas)
    MATCH (localPersonas)${leadDir}[${controlMatchString}|ALIAS_OF *1..]${trailDir}(list)-[:ALIAS_OF *0..1]->(listAgent)
    WHERE NOT (listAgent)-[:ALIAS_OF]->()
    ${withString}${parentAgent}, COLLECT(DISTINCT localAgents) AS ${personaAgent}, COLLECT(DISTINCT listAgent) AS listAgents
    UNWIND ${parentAgent} AS localAgents
    MATCH (localAgents) 
    WHERE NOT localAgents IN listAgents
    ${withString}${personaAgent}, COLLECT(DISTINCT localAgents) AS ${parentAgent}
    `;

  } else {

    queryString += `
    UNWIND ${parentAgent} AS localAgents
    MATCH (localAgents)-[:HAS_ALIAS *0..1]->(localPersonas)
    MATCH (localPersonas)${leadDir}[${controlMatchString}|ALIAS_OF *1..]${trailDir}(list)-[:ALIAS_OF *0..1]->(listAgent)
    WHERE NOT (listAgent)-[:ALIAS_OF]->()
      AND listAgent IN ${personaAgent}
    ${withString}${personaAgent}, COLLECT(DISTINCT localAgents) AS ${parentAgent}
    `;
  }

  return queryString;
}

const getFilterMatchQuery = (filter, parentName, sequence, withString) => {
  let queryString = getCypherFromQueryArray(filter.subset, parentName, sequence, withString);

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

const getFilterSetQuery = (filter, parentName, sequence, withString) => { 
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

const getAllPersonaName = (personaName) => {
  return personaName + "All";
}

const getAgentQuery = (personaName) => {
  const agentName = getAgentName(personaName);
  const agentNodes = agentName + "Nodes";
  const allPersonaName = getAllPersonaName(personaName);

  queryString = `MATCH (${personaName})-[:ALIAS_OF *0..1]->(${agentNodes})-[:HAS_ALIAS *0..1]->(${allPersonaName})
  WHERE NOT (${agentNodes})-[:ALIAS_OF]->()\n`;
  
  return queryString;
}

module.exports = { 
  getCypherFromQueryArray,
  testQuery,
};