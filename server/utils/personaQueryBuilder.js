const getPersonaQueries = (personas) => {

  console.log("Building queries for " + Object.keys(personas).length + " personas.");

  let removeQueries = [];
  let personaQueries = [];
  let aliasQueries = [];
  let controllerQueries = [];

  // remove all persona-persona relationships
  for(let item in personas) {
    removeQueries = removeRelationships(personas[item], removeQueries);
    personaQueries = addPersona(personas[item], personaQueries);
    aliasQueries = addAliases(personas[item], aliasQueries);
    controllerQueries = addControllers(personas[item], controllerQueries);
  }

  let totalQueries = removeQueries.length + personaQueries.length + aliasQueries.length + controllerQueries.length;
  console.log("Built " + totalQueries + " queries to process.");

  const allQueries = {
    removeQueries: removeQueries,
    personaQueries: personaQueries,
    aliasQueries: aliasQueries,
    controllerQueries: controllerQueries,
  }

  return allQueries;
}

const removeRelationships = (persona, queryArray) => {
  let upn = persona["upn"];

  // remove persona-persona relationships
  queryArray.push({
    query: `MATCH (p:Persona { upn: $upn })-[r:HAS_ALIAS|ALIAS_OF|CONTROLS]-(:Persona) DELETE r`,
    values: { upn: upn },
  });
  return queryArray;
}

const addPersona = (persona, queryArray) => {
  let rawPersona = persona;
  let upn = rawPersona["upn"];

  // let cleanPropString = "";
  // let firstProp = true;
  let cleanPersona = {};

  let queryString = `MERGE (persona:Persona { upn: $upn })
    SET persona += $cleanPersona
  `;

  for (let prop in rawPersona) {
    switch(prop) {
      case "aliases":
      case "controllers":
      case "upn":
      case "metadata":
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

const addControllers = (persona, queryArray) => {
  let arr = persona.controllers;
  let upn = persona.upn;

  for(let controller in arr){
    let controllerUpn = arr[controller]["controllerUpn"];
    let accessLevel = arr[controller]["accessLevel"];
    let authorizationMin = arr[controller]["authorizationMin"];
    let relationshipString = getControlMergeString(accessLevel, authorizationMin);
    let query = `
      MATCH (persona:Persona { upn: $upn })
      MATCH (controller:Persona { upn: $controllerUpn })
      MERGE (controller)-[${relationshipString}]->(persona)
      `;
    queryArray.push({
      query: query,
      values: { upn: upn, controllerUpn: controllerUpn },
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
      MERGE (persona)-[:HAS_ALIAS]->(alias)
      MERGE (alias)-[:ALIAS_OF]->(persona)
      `;
    queryArray.push({
      query: query,
      values: { upn: upn, aliasUpn: aliasUpn },
    });
  }
  return queryArray;
}

const getRelationshipStringFromAccessLevel = (accessLevel) => {
  switch(accessLevel){
    case "indirect":
      return "INDIRECT_CONTROL";
    case "read":
      return "READ_CONTROL";
    case "guest":
      return "GUEST_CONTROL";
    case "user":
      return "USER_CONTROL";
    case "admin":
      return "ADMIN_CONTROL";
    case "superadmin":
      return "SUPERADMIN_CONTROL";
    case "system":
      return "SYSTEM_CONTROL";
  }
}

const getControlMergeString = (accessLevel, authorizationMin) => {
  let relationshipString = getRelationshipStringFromAccessLevel(accessLevel);
  return `:${relationshipString} { authorizationMin:${authorizationMin} }`;
}

const getControlMatchString = (accessLevels = [
  "indirect",
  "read",
  "guest",
  "user",
  "admin",
  "superadmin",
  "system",
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

module.exports = {
  getPersonaQueries,
  getControlMergeString,
  getControlMatchString,
}