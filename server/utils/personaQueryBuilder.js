const { Persona } = require('../utils/persona');
const { Graph } = require('../utils/graph');

const getPersonaQueries = (personas) => {

  console.log("Building queries for " + Object.keys(personas).length + " personas.");

  let removeQueries = [];
  let personaQueries = [];
  let aliasQueries = [];
  let memberQueries = [];

  // remove all persona-persona relationships
  for(let item in personas) {
    removeQueries = removeRelationships(personas[item], removeQueries);
    personaQueries = addPersona(personas[item], personaQueries);
    aliasQueries = addAliases(personas[item], aliasQueries);
    memberQueries = addMembers(personas[item], memberQueries);
  }

  let totalQueries = removeQueries.length + personaQueries.length + aliasQueries.length + memberQueries.length;
  console.log("Built " + totalQueries + " queries to process.");

  const allQueries = {
    removeQueries: removeQueries,
    personaQueries: personaQueries,
    aliasQueries: aliasQueries,
    memberQueries: memberQueries,
  }

  return allQueries;
}

const removeRelationships = (persona, queryArray) => {
  let upn = persona[Persona.Properties.UPN];

  // remove persona-persona relationships
  queryArray.push({
    query: `MATCH (p:Persona { upn: $upn })-[r:HAS_ALIAS|ALIAS_OF|CONTROLS]-(:Persona) DELETE r`,
    values: { upn: upn },
  });
  return queryArray;
}

const addPersona = (persona, queryArray) => {
  let rawPersona = persona;
  let upn = rawPersona[Persona.Properties.UPN];

  // let cleanPropString = "";
  // let firstProp = true;
  let cleanPersona = {};

  let queryString = `MERGE (persona:Persona { upn: $upn })
    SET persona += $cleanPersona
  `;

  for (let prop in rawPersona) {
    switch(prop) {
      case Persona.Properties.Aliases:
      case Persona.Properties.Members:
      case Persona.Properties.UPN:
        break;
      default:
        cleanPersona[prop] = rawPersona[prop];
        break;
    }
  } // for props in persona

  queryArray.push({
    query: queryString,
    values: { upn: upn, cleanPersona: cleanPersona},
  });
  return queryArray;
}

const addMembers = (persona, queryArray) => {
  let memberArray = persona.members;
  let upn = persona.upn;

  for(let member in memberArray){
    let memberUpn = memberArray[member]["persona"];
    let accessLevel = memberArray[member]["accessLevel"];
    let authorizationMin = memberArray[member]["authorizationMin"];
    let relationshipString = getControlMergeString(accessLevel, authorizationMin);
    let query = `
      MATCH (persona:Persona { upn: $upn })
      MATCH (controller:Persona { upn: $memberUpn })
      MERGE (controller)-[${relationshipString}]->(persona)
      `;
    queryArray.push({
      query: query,
      values: { upn: upn, memberUpn: memberUpn },
    });
  }
  return queryArray;
}

const addAliases = (persona, queryArray) => {
  let aliasArray = persona.aliases;
  let upn = persona.upn;

  for(let alias in aliasArray){
    let aliasUpn = aliasArray[alias];
    let query = `
      MATCH (persona:Persona { upn: $upn })
      MATCH (alias:Persona { upn: $aliasUpn })
      MERGE (persona)-[:${Graph.Relationship.HasAlias}]->(alias)
      MERGE (alias)-[:${Graph.Relationship.AliasOf}]->(persona)
      `;
    queryArray.push({
      query: query,
      values: { upn: upn, aliasUpn: aliasUpn },
    });
  }
  return queryArray;
}

const getRelationshipStringFromAccessLevel = (accessLevel) => {
  let relationshipString = "";
  switch(accessLevel){
    case Persona.Relationship.Members.AccessLevel.Read:
      relationshipString = Graph.Relationship.Read;
      break;
    case Persona.Relationship.Members.AccessLevel.Guest:
      relationshipString = Graph.Relationship.Guest;
      break;
    case Persona.Relationship.Members.AccessLevel.User:
      relationshipString = Graph.Relationship.User;
      break;
    case Persona.Relationship.Members.AccessLevel.Admin:
      relationshipString = Graph.Relationship.Admin;
      break;
    case Persona.Relationship.Members.AccessLevel.SuperAdmin:
      relationshipString = Graph.Relationship.Superadmin;
      break;
    case Persona.Relationship.Members.AccessLevel.System:
      relationshipString = Graph.Relationship.System;
      break;
    default:
      relationshipString = Graph.Relationship.Indirect;
      break;
  }
  return relationshipString;
}

const getControlMergeString = (accessLevel, authorizationMin) => {
  let relationshipString = getRelationshipStringFromAccessLevel(accessLevel);
  return `:${relationshipString} { authorizationMin:${authorizationMin} }`;
}

const getControlMatchString = (accessLevels = [
  Persona.Relationship.Members.AccessLevel.Indirect,
  Persona.Relationship.Members.AccessLevel.Read,
  Persona.Relationship.Members.AccessLevel.Guest,
  Persona.Relationship.Members.AccessLevel.User,
  Persona.Relationship.Members.AccessLevel.Admin,
  Persona.Relationship.Members.AccessLevel.SuperAdmin,
  Persona.Relationship.Members.AccessLevel.System,
]) => {

  let relationshipString = ":";
  let first = true;

  for(let level in accessLevels){
    let relationship = getRelationshipStringFromAccessLevel(accessLevels[level]);
    if(first){
      relationshipString += `${relationship}`;
      first = false;
    } else {
      relationshipString += `|${relationship}`;
    }
  }
  return relationshipString;
}

const personaQueryBuilder = {
  getPersonaQueries,
  getControlMergeString,
  getControlMatchString,
}

module.exports = { 
  personaQueryBuilder,
}