const { database } = require('../utils/database.js');
const personaQueryBuilder = require('../utils/personaQueryBuilder.js');
const filterQueryBuilder = require('../utils/filterQueryBuilder.js');

const getPersona = async (personaUpn) => {
  const query = `MATCH (p)
  WHERE p.upn="${personaUpn}"
  RETURN DISTINCT p
  LIMIT 1`;
  const result = await database.dbQuery(query);
  const persona = result.records[0].get('p').properties;
  return persona;
}

/**
 * params
 * @param {Number} page 
 * @param {Number} pageSize 
 * @param {Object} query 
 * @returns 
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
    const queryFiltered = filterQueryBuilder.getCypherFromQueryArray(filterQueryObject)
    console.log(queryFiltered)
    result = await database.dbQuery(queryFiltered, page, pageSize);
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
  getPersonas,
  getPersonaControls,
  getPersonaObeys,
  getPersonaAgents,
  getAgentsControl,
  getAgentsObey,
  getPersonaCount,
}