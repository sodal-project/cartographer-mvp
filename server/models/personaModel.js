const { database } = require('../utils/database.js');
const personaQueryBuilder = require('../utils/personaQueryBuilder.js');
const discoveryRunner = require('../utils/discoveryRunner.js');

const getPersona = async (personaUpn) => {
  const query = `MATCH (p)
  WHERE p.upn="${personaUpn}"
  RETURN DISTINCT p
  LIMIT 1`;
  const result = await database.dbQuery(query);
  const persona = result.records[0].get('p').properties;
  return persona;
}

const linkPersonas = async (data) => {
}

const addPersona = async (data) => {
  const query = `
    CREATE (p:Participant {
      id: $id,
      upn: $upn,
      type: $type,
      platform: $platform,
      status: $status,
      friendlyName: $friendlyName,
      handle: $handle,
      firstName: $firstName,
      lastName: $lastName
    })
    RETURN p
  `;
  const result = await database.dbCreate(query, data)
  console.log(result)
  return result;
};

/**
 * params
 * @param {Number} page 
 * @param {Number} pageSize 
 * @param {Object} query 
 * @returns [{Object}] personas
 */
const getPersonas = async (page, pageSize, filterQueryObject) => {
  const queryAll = `MATCH (nAgent)
  WHERE NOT (nAgent)-[:ALIAS_OF]->()
  RETURN nAgent SKIP $skip LIMIT $limit`;
  let result
  if (filterQueryObject) {
    for(let i in filterQueryObject){
      console.log(filterQueryObject[i]);
    }
    result = await discoveryRunner.runQueryArray(filterQueryObject, page, pageSize);
  } else {
    result = await database.dbQuery(queryAll, page, pageSize);
  }
  const personas = result.records.map(record => record.get('nAgent'));
  return personas;
}

const getPersonaControls = async (personaUpn) => {
  const relationshipString = personaQueryBuilder.getControlMatchString();
  const query = `MATCH (p)-[:ALIAS_OF|HAS_ALIAS *0..2]->(agent)-[${relationshipString}]->(controls)
  WHERE p.upn="${personaUpn}"
  RETURN DISTINCT controls`;
  const result = await database.dbQuery(query);
  const personas = result.records.map(node => node._fields[0].properties);
  return personas;
};

const getPersonaObeys = async (personaUpn) => {
  const relationshipString = personaQueryBuilder.getControlMatchString();
  const query = `MATCH (p)-[:ALIAS_OF|HAS_ALIAS *0..2]->(agent)<-[${relationshipString}]-(obey)
  WHERE p.upn="${personaUpn}"
  RETURN DISTINCT obey`;
  const result = await database.dbQuery(query);
  const personas = result.records.map(node => node._fields[0].properties);
  return personas;
};

const getPersonaAgents = async (personaUpn) => {
  const query = `MATCH (p)-[:ALIAS_OF|HAS_ALIAS *0..2]->(agent)
  WHERE p.upn="${personaUpn}"
  RETURN DISTINCT agent`;
  const result = await database.dbQuery(query);
  const personas = result.records.map(node => node._fields[0].properties);
  return personas;
};

const getAgentsControl = async (personaUpn) => {
  const relationshipString = personaQueryBuilder.getControlMatchString();
  const query = `MATCH (p)-[:ALIAS_OF|HAS_ALIAS *0..2]->(agent)-[${relationshipString}]->(controls)
  WHERE p.upn="${personaUpn}"
  RETURN DISTINCT controls`;
  const result = await database.dbQuery(query);
  const personas = result.records.map(node => node._fields[0].properties);
  return personas;
};

const getAgentsObey = async (personaUpn) => {
  const relationshipString = personaQueryBuilder.getControlMatchString();
  const query = `MATCH (p)-[:ALIAS_OF|HAS_ALIAS *0..2]->(agent)<-[${relationshipString}]-(obey)
  WHERE p.upn="${personaUpn}"
  RETURN DISTINCT obey`;
  const result = await database.dbQuery(query);
  const personas = result.records.map(node => node._fields[0].properties);
  return personas;
};

const getPersonaCount = async () => {
  const query = `MATCH (n) RETURN count(n) AS total`;
  const result = await database.dbQuery(query);
  const total = result.records[0].get('total').toNumber();
  return total;
}

module.exports = {
  getPersona,
  addPersona,
  getPersonas,
  getPersonaControls,
  getPersonaObeys,
  getPersonaAgents,
  getAgentsControl,
  getAgentsObey,
  getPersonaCount,
}