const path = require('path');
const utilSourceStore = require('./sourceStore');
const graph = require('./graph');
const csvtojson = require('csvtojson');

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
    const csvPath = path.join(__dirname, `../data/${instance.name}`);
    const csvJsonData = await csvtojson().fromFile(csvPath);
    const r0 = csvJsonData[0];

    const store = utilSourceStore.newStore(source);

    // process personas csv
    if(r0.hasOwnProperty("id")&&r0.hasOwnProperty("type")&&r0.hasOwnProperty("platform")){
      console.log('Processing personas...');
      const personas = mapCsvPersonas(csvJsonData);
      utilSourceStore.addPersonas(store, personas);

    // process relationships csv
    } else if(r0.hasOwnProperty("controlUpn")&&r0.hasOwnProperty("obeyUpn")){
      console.log('Processing relationships...');
      const relationships = mapCsvRelationships(csvJsonData);
      utilSourceStore.addRelationships(store, relationships);

    } else {
      throw Error('CSV file does not contain the required columns');
    }

    // generate and process merge sync queries
    const oldStore = await utilSourceStore.readStore(source.id);
    const queries = oldStore ? utilSourceStore.getMergeSyncQueries(store, oldStore) : utilSourceStore.getMergeQueries(store);

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
    personas.push({
      upn: `upn:${data[i].platform}:${data[i].type}:${data[i].id}`,
      ...data[i]
    });
  }
  return personas;
}

const mapCsvRelationships = (data) => {
  const relationships = [];
  for(const i in data) {
    if(i === 0) { continue; }
    relationships.push(data[i]);
  }
  return relationships;
}

module.exports = {
  mergeSync
}