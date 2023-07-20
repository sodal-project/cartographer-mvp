const { database } = require('../utils/database.js');

const getPersonas = async (page, pageSize) => {
  const query = `MATCH (n) RETURN n SKIP $skip LIMIT $limit`;
  const result = await database.dbQuery(query, page, pageSize);
  const personas = result.records.map(record => record.get('n'));
  return personas;
}

const getPersonaControls = async (personaId) => {
  const query = `MATCH (p)-[:ALIAS_OF|HAS_ALIAS *0..2]->(agent)-[:MEMBER_OF]->(controls)
  WHERE p.id=${personaId}
  RETURN DISTINCT controls`;
  const result = await database.dbQuery(query);
  const personas = result.records.map(node => node._fields[0].properties);
  return personas;
};

const getPersonaObeys = async (personaId) => {
  const query = `MATCH (p)-[:ALIAS_OF|HAS_ALIAS *0..2]->(agent)-[:HAS_MEMBER]->(obey)
  WHERE p.id=${personaId}
  RETURN DISTINCT obey`;
  const result = await database.dbQuery(query);
  const personas = result.records.map(node => node._fields[0].properties);
  return personas;
};

const getPersonaAgents = async (personaId) => {
  const query = `MATCH (p)-[:ALIAS_OF|HAS_ALIAS *0..2]-(agent)
  WHERE p.id=${personaId}
  RETURN DISTINCT agent`;
  const result = await database.dbQuery(query);
  const personas = result.records.map(node => node._fields[0].properties);
  return personas;
};

const getAgentsControl = async (personaId) => {
  const query = `MATCH (p)-[:ALIAS_OF|HAS_ALIAS *0..2]->(agent)-[:MEMBER_OF]->(controls)
  WHERE p.id=${personaId}
  RETURN DISTINCT controls`;
  const result = await database.dbQuery(query);
  const personas = result.records.map(node => node._fields[0].properties);
  return personas;
};

const getAgentsObey = async (personaId) => {
  const query = `MATCH (p)-[:ALIAS_OF|HAS_ALIAS *0..2]->(agent)-[:HAS_MEMBER]->(obey)
  WHERE p.id=${personaId}
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
  getPersonas,
  getPersonaControls,
  getPersonaObeys,
  getPersonaAgents,
  getAgentsControl,
  getAgentsObey,
  getPersonaCount,
}