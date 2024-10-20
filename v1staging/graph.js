const {cache} = require('../utils/cache');
const CC = require('./constants');
const connector = require('./graphConnector');

  /* Fix: enable automatic pagination

  optionalParams.page = optionalParams.page || 1;
  const pageSize = optionalParams?.pageSize || 1500;
  const orderBy = optionalParams?.orderBy || "upn";
  const orderByDirection = optionalParams?.orderByDirection || "ASC";

  const skip = neo4j.int((page - 1) * pageSize);
  const limit = neo4j.int(pageSize);
  const optionalParams = { skip, limit, ...optionalParams};
  */

const defaultPageParams = {
  page: 1,
  pageSize: 1500, 
  orderBy: "upn",
  orderByDirection: "ASC",
}

const defaultAccessLevels = [
  CC.LEVEL.ALIAS,
  CC.LEVEL.ADMIN,
  CC.LEVEL.MANAGE,
  CC.LEVEL.ACT_AS,
]

const convertToUpnArray = (graph) => {

}

//
// READ
//

const readSource = async (sourceId) => {
  const query = `MATCH (source:Source {id: $sourceId})
  RETURN source`

  const response = await connector.runRawQuery(query, { sourceId });

  const source = response.records.map(record => {
    return record.get('source').properties;
  });
  if(response.summary.notifications.length > 0) {
    console.log('Notifications:', response.summary.notifications);
  }
  return source[0];
}

const readPersonaDeclarations = async (upn) => {

}

const readPersonaProperties = async (upn) => {

}

const readPersonaControl = async (upn, levels, recursive = false, pageParams) => {

}

const readPersonaObey = async (upn, levels, recursive = false, pageParams) => {

}

const readSourcePersonas = async (sourceId) => {
  const query = `MATCH (source:Source {id: $sourceId})-[:DECLARE]->(persona:Persona)
  RETURN persona`

  const response = await connector.runRawQuery(query, { sourceId });

  const personas = response.records.map(record => {
    return record.get('persona').properties;
  });
  if(response.summary.notifications.length > 0) {
    console.log('Notifications:', response.summary.notifications);
  }
  return personas;
}

const readSourceRelationships = async (sourceId) => {
  const query = `MATCH (persona:Persona)-[rel:CONTROL]->(relation:Persona)
  WHERE rel.sourceId = $sourceId
  RETURN DISTINCT persona.upn AS controlUpn, relation.upn AS obeyUpn, properties(rel)`

  const response = await connector.runRawQuery(query, { sourceId });

  const relationships = response.records.map(record => {
    const controlUpn = record.get('controlUpn');
    const obeyUpn = record.get('obeyUpn');
    return { controlUpn, obeyUpn, ...record.get('properties(rel)') };
  });
  if(response.summary.notifications.length > 0) {
    console.log('Notifications:', response.summary.notifications);
  }

  return relationships;
}

const readOrphanedPersonas = async () => {

}

// persona property search
/*
filter: {
  props: {
    ids: [],
    upns: [],
    platforms: [],
    types: [],
  }
  obey: {
    levels: [],
    sources: [],
    min-confidence: 0,
    max-confidence: 1,
  }
  control: {
    levels: [],
    sources: [],
    min-confidence: 0,
    max-confidence: 1,
  }
  source: {
    ids: [],
    min-confidence: 0,
    max-confidence: 1,
  }
}

*/
const readFilter = async (filter, pageParams) => {

}

//
// WRITE 
//

const mergeSource = async (source) => {
  const query = `MERGE (source:Source {id: $source.id})
  SET source.id = $source.id, source.name = $source.name, source.lastUpdate = $source.lastUpdate
  RETURN source`

  const response = await connector.runRawQuery(query, { source });
  const graphSource = response.records.map(record => {
    return record.get('source').properties;
  });
  if(response.summary.notifications.length > 0) {
    console.log('Notifications:', response.summary.notifications);
  }
  return graphSource[0];
}

const mergePersonaDeclaration = async (sourceId, personaUpn, confidence) => {

}

const mergeRelationshipDeclaration = async (relationshipObject) => {

}

const removePersonaDeclaration = async (sourceId, personaUpn) => {

}

const removeRelationshipDeclaration = async (sourceId, controlUpn, obeyUpn) => {

}

//
// Query Calls
// 

const runRawQuery = async (query, optionalParams) => {
  const result = await connector.runRawQuery(query, optionalParams);
  return result;
}

const runRawQueryArray = async (queryArray) => {
  const result = await connector.runRawQueryArray(queryArray);
  await cache.save(`z-rawQueryResult`, result)
  return result;
}

module.exports = {
  readSource,
  readPersonaDeclarations,
  readPersonaProperties,
  readPersonaControl,
  readPersonaObey,
  readSourcePersonas,
  readSourceRelationships,
  readOrphanedPersonas,
  readFilter,
  mergeSource,
  mergePersonaDeclaration,
  mergeRelationshipDeclaration,
  removePersonaDeclaration,
  removeRelationshipDeclaration,
  runRawQuery,
  runRawQueryArray,
}