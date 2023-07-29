require('dotenv').config();
const neo4j = require('neo4j-driver');
// const { Persona } = require('../utils/persona');
const { buildPersonasQueries } = require('../utils/personaQueryBuilder');
// const { query } = require('express');

const Config = {
  db_host: 'bolt://cartographer-neo4j-db-1:7687',
  db_username: process.env.DB_USERNAME,
  db_password: process.env.DB_PASSWORD,
  firstRun: true,
};

const setupDatabase = async () => {

  console.log("*** Setting up database... ***");

  try {
    const query = "CREATE CONSTRAINT FOR (a:Persona) REQUIRE a.upn IS UNIQUE";
    const response = await dbQuery(query);
    console.log(response);
  } catch (error) {
    console.error('Error setting up database:', error);
  }
  console.log("*** Database setup complete.***");
}

const purgeDatabase = async () => {

  console.log("Purging database...");
  try {
    await dbQuery('MATCH (node) DETACH DELETE node');
    console.log('Database purged.')
  } catch (error) {
    console.error('Error purging database:', error);
    throw error;
  } 
}

const mergePersonas = async (personas) => {

  if(Config.firstRun){
    await setupDatabase();
    Config.firstRun = false;
  }

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

const dbQuery = async (query, page=1, pageSize=1500) => {
  const driver = neo4j.driver(Config.db_host, neo4j.auth.basic(Config.db_username, Config.db_password));
  const session = driver.session();

  try {
    const skip = neo4j.int((page - 1) * pageSize);
    const params = { skip, limit: neo4j.int(pageSize)};
    const result = await session.run(query, params);
    return result;
  } catch (error) {
    console.error('Error processing query:', error);
    throw error;
  } finally {
    session.close();
    driver.close();
  }
}

// batch process an array of query + paramater values
const runQueryArray = async (queryArray) => {

  console.log('--- Begin processing query array with ' + queryArray.length + ' queries...');
  console.log('Connecting to... ' + Config.db_host);

  const driver = neo4j.driver(Config.db_host, neo4j.auth.basic(Config.db_username, Config.db_password), { encrypted: false });
  const session = driver.session();
  const transaction = session.beginTransaction();
  let response = {};

  try {
    const tPromisesArray = [];

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
        response = results;
        console.log("--- End processing query array. Completed " + results.length + " transactions.");
      }
    );
    await transaction.commit();
  } catch (error) {
    console.log(`unable to execute query. ${error}`)
  } finally {
    await session.close()
    await driver.close()
  }

  return response;
}

const database = {
  dbQuery,
  mergePersonas,
  purgeDatabase,
};

module.exports = { 
  database,
};