const path = require('path');
const csvtojson = require('csvtojson');
const {cache} = require('../utils/cache');
const core = require('./core');

const mergeSync = async (instance) => {
  try {

    // TODO switch to real instance id
    const instanceId = instance.name.replace(/\s/g, "");

    const source = {
      id: `source:csv:${instanceId}`,
      name: instance.name,
      lastUpdate: new Date().toISOString()
    }

    console.log(`Processing CSV file ${instance.name}...`);
    const csvPath = path.join(__dirname, `../data/integrations/${instance.file}`);
    const csvJsonData = await csvtojson().fromFile(csvPath);
    const r0 = csvJsonData[0];

    const store = core.sourceStore.newStore(source);

    // process personas csv
    if(r0.hasOwnProperty("id")&&r0.hasOwnProperty("type")&&r0.hasOwnProperty("platform")){
      console.log('Processing personas...');
      const personas = mapCsvPersonas(csvJsonData);
      core.sourceStore.addPersonas(store, personas);

    // process relationships csv
    } else if(r0.hasOwnProperty("controlUpn")&&r0.hasOwnProperty("obeyUpn")){
      console.log('Processing relationships...');
      const relationships = mapCsvRelationships(csvJsonData);
      core.sourceStore.addRelationships(store, relationships);

    } else {
      throw Error('CSV file does not contain the required columns');
    }

    // generate and process merge sync queries
    const oldStore = await core.sourceStore.readStore(source.id);
    const queries = core.sourceStore.getMergeSyncQueries(store, oldStore);

    // execute queries
    await cache.save(`z-mergeQuery-csv-${instanceId}`, queries);
    await core.graph.runRawQueryArray(queries);

    // await graph.runRawQueryArray(queries);
    console.log(`CSV file processed successfully, ${queries.length} queries executed`);

  } catch (error) {
    console.error('Error processing CSV file:', error);
  }
}

const mapCsvPersonas = (data) => {
  const personas = [];
  for(const i in data) {
    if(i === 0) { continue; }
    const persona = {
      upn: `upn:${data[i].platform}:${data[i].type}:${data[i].id}`,
      ...data[i]
    }
    persona.id = `${persona.id}`;
    personas.push(persona);
  }
  return personas;
}

const mapCsvRelationships = (data) => {
  const relationships = [];
  for(const i in data) {
    if(i === 0) { continue; }
    const rel = data[i];
    rel.level = parseInt(rel.level);
    rel.confidence = parseFloat(rel.confidence);
    if(rel.authorizationMin){
      rel.authorizationMin = parseInt(rel.authorizationMin);
    }
    relationships.push(data[i]);
  }
  return relationships;
}

module.exports = {
  mergeSync
}