require('dotenv').config();
const neo4j = require('neo4j-driver');
// const { Persona } = require('../utils/persona');
const { buildPersonasQueries } = require('../utils/personaQueryBuilder');
// const { query } = require('express');

const DB_HOST = 'bolt://cartographer-neo4j-db-1:7687';
const DB_USERNAME = process.env.DB_USERNAME;
const DB_PASSWORD = process.env.DB_PASSWORD;

const mergePersonas = async (personas) => {

  console.log("Processing merge for " + Object.keys(personas).length + " personas.");

  let allQueries = buildPersonasQueries(personas);

  for(let key in allQueries){
    let queries = allQueries[key];
    console.log("Generated " + queries.length + " queries to process.");
    console.log(`Attempting to run ${key} queries...`);

    const startTime = performance.now();

    await runQueryArray(queries);

    const duration = performance.now() - startTime;
    console.log(`Processed ${queries.length} queries in ${duration} milliseconds.`);
  }
  console.log("Merge complete.");
}

const purgeDatabase = async () => {
  const driver = neo4j.driver(DB_HOST, neo4j.auth.basic(DB_USERNAME, DB_PASSWORD));
  const session = driver.session();

  console.log("Purging database...");
  try {
    await session.run('MATCH (n) DETACH DELETE n');
    console.log('Database purged.')
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

// batch process an array of query + paramater values
async function runQueryArray(queryArray) {

  console.log('--- Begin processing query array with ' + queryArray.length + ' queries...');
  console.log('Connecting to... ' + DB_HOST);

  // Set up the Neo4j driver
  const driver = neo4j.driver(DB_HOST, neo4j.auth.basic(DB_USERNAME, DB_PASSWORD), { encrypted: false });

  try {
    await driver.verifyConnectivity()
  } catch (error) {
    console.log(`connectivity verification failed. ${error}`)
  }

  const session = driver.session();
  const transaction = session.beginTransaction();
  const tPromisesArray = [];

  try {
    let querySize = queryArray.length + 1;

    for(let q in queryArray){
      let curQueryObj = queryArray[q];
      let curQueryString = curQueryObj["query"];
      let curQueryValues = curQueryObj["values"];
    
      let tPromise = transaction.run(curQueryString, curQueryValues);
      tPromisesArray.push(tPromise);
    }

    console.log("All query transactions submitted, waiting for completion...");
    // wait for all transactions to finish
    await Promise.all(tPromisesArray).then(
      (results) => {
        console.log("--- End processing query array. Completed " + results.length + " transactions.");
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