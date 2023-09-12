const { database } = require('../utils/database.js');
const personaQueryBuilder = require('../utils/personaQueryBuilder.js');
const discoveryRunner = require('../utils/discoveryRunner.js');

const allRelationships = [
  "read",
  "guest",
  "user",
  "admin",
  "superadmin",
  "system",
]

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
  const query = `
    MATCH (node1:Persona {upn: '${data.participantUpn}'}), (node2:Persona {upn: '${data.personaUpn}'})
    CREATE (node1)-[:SUPERADMIN_CONTROL]->(node2)
  `;
  const result = await database.dbCreate(query, data)
  return result;
}

const addPersona = async (data) => {
  const query = `
    CREATE (p:Persona {
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
  return result;
};

/**
 * params
 * @param {Number} page 
 * @param {Number} pageSize 
 * @param {Object} query 
 * @returns [{Object}] personas
 */
const getPersonas = async (page, pageSize, filterQueryObject = []) => {
  for(let i in filterQueryObject){
    console.log(filterQueryObject[i]);
  }
  const result = await discoveryRunner.runQueryArray(filterQueryObject, page, pageSize);
  return result;
}

const getPersonaControls = async (personaUpn) => {
  const relationshipString = personaQueryBuilder.getControlMatchString(allRelationships);
  const query = `MATCH (p)-[:ALIAS_OF|HAS_ALIAS *0..2]->(agent)-[${relationshipString}]->(controls)
  WHERE p.upn="${personaUpn}"
  RETURN DISTINCT controls`;
  const result = await database.dbQuery(query);
  const personas = result.records.map(node => node._fields[0].properties);
  return personas;
};

const getPersonaObeys = async (personaUpn) => {
  const relationshipString = personaQueryBuilder.getControlMatchString(allRelationships);
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
  const relationshipString = personaQueryBuilder.getControlMatchString(allRelationships);
  const query = `MATCH (p)-[:ALIAS_OF|HAS_ALIAS *0..2]->(agent)-[rel${relationshipString}]->(controls)
  WHERE p.upn="${personaUpn}"
  RETURN DISTINCT controls, rel`;
  const result = await database.dbQuery(query);
  const properties = result.records.map(node => node._fields[0].properties);
  const relationships = result.records.map(node => node._fields[1].type);
  const personas = properties.map((item, index) => ({
    ...item,
    access: relationships[index],
  }));
  return personas;
};

const getAgentsObey = async (personaUpn) => {
  const relationshipString = personaQueryBuilder.getControlMatchString(allRelationships);
  const query = `MATCH (p)-[:ALIAS_OF|HAS_ALIAS *0..2]->(agent)<-[rel${relationshipString}]-(obey)
  WHERE p.upn="${personaUpn}"
  RETURN DISTINCT obey, rel`;
  const result = await database.dbQuery(query);
  const properties = result.records.map(node => node._fields[0].properties);
  const relationships = result.records.map(node => node._fields[1].type);
  const personas = properties.map((item, index) => ({
    ...item,
    access: relationships[index],
  }));
  return personas;
};

const getPersonaCount = async () => {
  const query = `MATCH (n) RETURN count(n) AS total`;
  const result = await database.dbQuery(query);
  const total = result.records[0].get('total').toNumber();
  return total;
}

const deletePersona = async (upn) => {
  const query = `
    MATCH (n { upn: '${upn}' })
    DETACH DELETE n;
  `;
  const result = await database.dbDelete(query)
  return result;
}

module.exports = {
  getPersona,
  addPersona,
  deletePersona,
  linkPersonas,
  getPersonas,
  getPersonaControls,
  getPersonaObeys,
  getPersonaAgents,
  getAgentsControl,
  getAgentsObey,
  getPersonaCount,
}