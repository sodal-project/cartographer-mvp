const {Persona} = require('../utils/persona');
const {cache} = require('../utils/cache');
const path = require('path');
const csvtojson = require('csvtojson');

async function generateAllPersonas(integration) {
  console.log(`Processing CSV file ${integration.name}...`);

  const csvFilePath = path.join(__dirname, `../data/integrations/${integration.file}`);
  const csvData = await csvtojson().fromFile(csvFilePath);

  if(csvData[0].hasOwnProperty("friendlyName")) {
    addCsvPersonas(csvData);
  } else {
    addCsvControllers(csvData);
  }

  try {
    // await cache.save("allPersonas", Persona.localStore);
  } catch(error) {
    console.log(error);
  }
  console.log(`Completed processing CSV file ${integration.name}...`);
  return Persona.localStore;
}

function addCsvPersonas(data){
  for(let i in data) {
    let row = data[i];
    let standardProps = {
      "id": row["id"],
      "type": row["type"],
      "platform": row["platform"],
      "status": row["status"],
      "friendlyName": row["friendlyName"],
    }
    let customProps = {};
    for(let prop in row) {
      if(row[prop] !== "" && !standardProps[prop]) {
        customProps[prop] = row[prop];
      }
    }
    Persona.create(standardProps, customProps);
  }
}

function addCsvControllers(data){
  for(let i in data) {
    let row = data[i];
    let subordinateUpn = row["subordinateUpn"];
    let controllerUpn = row["controllerUpn"];
    let accessLevel = row["accessLevel"];
    let authorizationMin = row["authorizationMin"];
    Persona.addController(subordinateUpn, controllerUpn, accessLevel, authorizationMin);
  }
}

const csvIntegration = {
  generateAllPersonas,
}

module.exports = { 
  csvIntegration
};