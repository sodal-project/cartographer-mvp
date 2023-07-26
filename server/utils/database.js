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
    AliasOf: "ALIAS_OF",
    // Obeys: "OBEYS", //HasMember: "HAS_MEMBER",
    Controls: "CONTROLS", //MemberOf: "MEMBER_OF",
    Reader: "READER",
    Guest: "GUEST",
    User: "USER",
    Admin: "ADMIN",
    Superadmin: "SUPERADMIN",
    Indirect: "INDIRECT",
    System: "SYSTEM",
  }
}

// 
// import current personas and relationships from database
// use this to track and only update changed personas
//

const mergePersonas = async (personas) => {

  let queryAll = [];
  let cleanAll = [];

  // remove all persona-persona relationships
  for(let item in personas) {
    cleanAll = generatePersonaRemoveRelationshipsQuery(personas[item], queryAll);
  }
  console.log("Generated " + cleanAll.length + " relationship cleanup queries.");
  console.log("Attempting to run queries...");

  await runQueryArray(cleanAll);

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

const generatePersonaRemoveRelationshipsQuery = (persona, queryArray) => {
  let upn = persona[Persona.Properties.UPN];

  // remove persona-persona relationships
  queryArray.push({
    query: `MATCH (p:Persona { upn: $upn })-[r:HAS_ALIAS|ALIAS_OF|CONTROLS]-(:Persona) DELETE r`,
    values: { upn: upn },
  });

  return queryArray;
}

const generatePersonaMergeQuery = (persona, queryArray) => {
  let rawPersona = persona;
  let upn = rawPersona[Persona.Properties.UPN];

  let cleanPersona = {};

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
    let q = `MERGE (p:Persona { upn: $upn })
      MERGE (controller:Persona { upn: $memberUpn })
      MERGE (controller)-[:${Graph.Relationship.Controls} { accessLevel: $accessLevel, authorizationMin: $authorizationMin }]->(p)
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
    let q = `MERGE (p:Persona { upn: $upn })
      MERGE (alias:Persona { upn: $aliasUpn })
      MERGE (p)-[:${Graph.Relationship.HasAlias}]->(alias)
      MERGE (alias)-[:${Graph.Relationship.AliasOf}]->(p)
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
  dbQuery,
  mergePersonas,
  purgeDatabase,
};

module.exports = { 
  database,
};