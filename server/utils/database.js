require('dotenv').config();
const neo4j = require('neo4j-driver');
const {Persona} = require('../utils/persona');
const { query } = require('express');

const DB_HOST = 'bolt://cartographer-neo4j-db-1:7687';
const DB_USERNAME = process.env.DB_USERNAME;
const DB_PASSWORD = process.env.DB_PASSWORD;

const Graph = {
  Node: {
    Persona: "Persona",
  },
  Relationship: {
    HasAlias: "HAS_ALIAS",
    HasMember: "HAS_MEMBER",
    MemberOf: "MEMBER_OF",
    AliasOf: "ALIAS_OF",
  }
}

// 
// import current personas and relationships from database
// use this to track and only update changed personas
//

//
// merge object list of personas into database
// TODO: add DETACH DELETE for removal-flagged items
// 
const mergePersonas = async (personas) => {

  let queryAll = [];

  // build from object of personas
  for(let item in personas) {
    queryAll = generatePersonaMergeQuery(personas[item], queryAll);
  }

  console.log("Generated " + queryAll.length + " queries to process.");
  console.log("Attempting to run queries...");

  await runQueryArray(queryAll);

  console.log("Completed Persona Merge.");
}

const purgeDatabase = async () => {
  const driver = neo4j.driver(DB_HOST, neo4j.auth.basic(DB_USERNAME, DB_PASSWORD));
  const session = driver.session();

  try {
    await session.run('MATCH (n) DETACH DELETE n');
  } catch (error) {
    console.error('Error purging database:', error);
    throw error;
  } finally {
    session.close();
    driver.close();
  }
}

const dbQuery = async (query, page=1, pageSize=1500) => {
  const driver = neo4j.driver(DB_HOST, neo4j.auth.basic(DB_USERNAME, DB_PASSWORD));
  const session = driver.session();

  try {
    const skip = neo4j.int((page - 1) * pageSize);
    const params = { skip, limit: neo4j.int(pageSize)};
    const result = await session.run(query, params);
    return result;
  } catch (error) {
    console.error('Error fetching nodes:', error);
    throw error;
  } finally {
    session.close();
    driver.close();
  }
}

const getPersonas = async (page, pageSize) => {
  const query = `MATCH (n) RETURN n SKIP $skip LIMIT $limit`;
  const result = await dbQuery(query, page, pageSize);
  const personas = result.records.map(record => record.get('n'));
  return personas;
}

const getPersonaControls = async (personaId) => {
  const query = `MATCH (p)-[:ALIAS_OF|HAS_ALIAS *0..2]->(agent)-[:MEMBER_OF]->(controls)
  WHERE p.id=${personaId}
  RETURN DISTINCT controls`;
  const result = await dbQuery(query);
  const personas = result.records.map(node => node._fields[0].properties);
  return personas;
};

const getPersonaObeys = async (personaId) => {
  const query = `MATCH (p)-[:ALIAS_OF|HAS_ALIAS *0..2]->(agent)-[:MEMBER_OF]->(obey)
  WHERE p.id=${personaId}
  RETURN DISTINCT obey`;
  const result = await dbQuery(query);
  const personas = result.records.map(node => node._fields[0].properties);
  return personas;
};

const getPersonaAgents = async (personaId) => {
  const query = `MATCH (p)-[:ALIAS_OF|HAS_ALIAS *0..2]-(agent)
  WHERE p.id=${personaId}
  RETURN DISTINCT agent`;
  const result = await dbQuery(query);
  const personas = result.records.map(node => node._fields[0].properties);
  return personas;
};

const getAgentsControl = async (personaId) => {
  const query = `MATCH (p)-[:ALIAS_OF|HAS_ALIAS *0..2]->(agent)-[:MEMBER_OF]->(controls)
  WHERE p.id=${personaId}
  RETURN DISTINCT controls`;
  const result = await dbQuery(query);
  const personas = result.records.map(node => node._fields[0].properties);
  return personas;
};

const getAgentsObey = async (personaId) => {
  const query = `MATCH (p)-[:ALIAS_OF|HAS_ALIAS *0..2]->(agent)-[:MEMBER_OF]->(obey)
  WHERE p.id=${personaId}
  RETURN DISTINCT obey`;
  const result = await dbQuery(query);
  const personas = result.records.map(node => node._fields[0].properties);
  return personas;
};

const getPersonaCount = async () => {
  const query = `MATCH (n) RETURN count(n) AS total`;
  const result = await dbQuery(query);
  const total = result.records[0].get('total').toNumber();
  return total;
}

const generatePersonaMergeQuery = (persona, queryArray) => {
  let rawPersona = persona;
  let upn = rawPersona[Persona.Properties.UPN];

  let cleanPersona = {};

  // TODO: create DETACH DELETE query 
  if(rawPersona[Persona.Properties.ToDelete]){
    // process toDelete queries
    // remove persona
    // remove aliases
  }

  for (let prop in rawPersona) {
    switch(prop) {
      // add alias relationships
      case Persona.Properties.Aliases:
        queryArray = generateAliasMergeQueries(rawPersona, queryArray);
        break;
      // add member relationships
      case Persona.Properties.Members:
        queryArray = generateMemberMergeQueries(rawPersona, queryArray);
        break;
      case Persona.Properties.UPN:
      case Persona.Properties.ToDelete:
      case Persona.Properties.ToVerify:
        // code
        break;
      default:
        // include all but alias, member, and upn
        cleanPersona[prop] = rawPersona[prop];
    } // switch
  } // for props in persona

  let q = `MERGE (p:Persona { upn: $upn })
    SET p += $cleanPersona
  `;
  queryArray.push({
    query: q,
    values: { upn: upn, cleanPersona: cleanPersona },
  });
  return queryArray;
}

const generateMemberMergeQueries = (persona, queryArray) => {
  let memberArray = persona.members;
  let upn = persona.upn;

  for(let member in memberArray){
    let memberUpn = memberArray[member]["persona"];
    let accessLevel = memberArray[member]["accessLevel"];
    let authorizationMin = memberArray[member]["authorizationMin"];
    let q = `MERGE (parent:Persona { upn: $upn })
      MERGE (member:Persona { upn: $memberUpn })
      MERGE (member)-[:${Graph.Relationship.MemberOf} { accessLevel: $accessLevel, authorizationMin: $authorizationMin }]->(parent)
      MERGE (parent)-[:${Graph.Relationship.HasMember} { accessLevel: $accessLevel, authorizationMin: $authorizationMin }]->(member)
    `;
    queryArray.push({
      query: q, 
      values: { upn: upn, memberUpn: memberUpn, accessLevel: accessLevel, authorizationMin: authorizationMin },
    });
  }
  return queryArray;
}

const generateAliasMergeQueries = (persona, queryArray) => {
  let aliasArray = persona.aliases;
  let upn = persona.upn;

  for(let alias in aliasArray){
    let aliasUpn = aliasArray[alias];
    let q = `MERGE (parent:Persona { upn: $upn })
      MERGE (alias:Persona { upn: $aliasUpn })
      MERGE (parent)-[:${Graph.Relationship.HasAlias}]->(alias)
      MERGE (alias)-[:${Graph.Relationship.AliasOf}]->(parent)
    `;
    queryArray.push({
      query: q,
      values: { upn: upn, aliasUpn: aliasUpn },
    });
  }
  return queryArray;
}

// batch process an array of query + paramater values
async function runQueryArray(queryArray) {

  console.log('Connecting to... ' + DB_HOST);

  // Set up the Neo4j driver
  const driver = neo4j.driver(DB_HOST, neo4j.auth.basic(DB_USERNAME, DB_PASSWORD), { encrypted: false });

  try {
    await driver.verifyConnectivity()
    console.log('Database connected...')
  } catch (error) {
    console.log(`connectivity verification failed. ${error}`)
  }

  const session = driver.session();
  const transaction = session.beginTransaction();
  const tPromisesArray = [];

  try {
    console.log("Processing query array...");
    let querySize = queryArray.length + 1;

    for(let q in queryArray){
      let curQueryObj = queryArray[q];
      let curQueryString = curQueryObj["query"];
      let curQueryValues = curQueryObj["values"];
    
      let tPromise = transaction.run(curQueryString, curQueryValues);
      tPromisesArray.push(tPromise);
    }

    console.log("\nAll queries submitted, waiting for completion...");
    // wait for all transactions to finish
    await Promise.all(tPromisesArray).then(
      (results) => {
        console.log("Completed " + results.length + " transactions.");
      }
    );
    await transaction.commit();

  } catch (error) {
    console.log(`unable to execute query. ${error}`)
  } finally {
    await session.close()
  }

  // ... on application exit:
  await driver.close()
}

const database = {
  mergePersonas,
  purgeDatabase,
  getPersonas,
  getPersonaControls,
  getPersonaObeys,
  getPersonaAgents,
  getAgentsControl,
  getAgentsObey,
  getPersonaCount
};

module.exports = { 
  database,
};