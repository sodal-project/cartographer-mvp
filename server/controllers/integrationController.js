const {githubIntegration} = require('../integrations/github.js');
const {googleIntegration} = require('../integrations/google.js'); // Assuming you have separate files for each integration
const {database} = require('../utils/database.js'); // Assuming you have a separate file for database operations

const IntegrationModel = require('../models/integrationModel');

function getIntegrations(req, res) {
  IntegrationModel.getIntegrations((err, integrations) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Error occurred while reading the integrations data.' });
    }
    return res.status(200).json(integrations);
  });
}

function addIntegration(req, res) {
  const data = {
    id: req.body.id,
    name: req.body.name,
    token: req.body.token,
    type: req.body.type,
    keyfile: req.file?.filename,
  };

  let errors = [];
  if (!data.name) {
    errors.push('The name field cannot be blank');
  }
  if (!data.token) {
    errors.push('The token field cannot be blank');
  }
  if (errors.length > 0) {
    res.status(400).json({ errors: errors });
    return;
  }

  IntegrationModel.addIntegration(data, (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json(err);
    }
    return res.status(200).json(result);
  });
}

function deleteIntegration(req, res) {
  const itemId = req.params.id;
  IntegrationModel.deleteIntegration(itemId, (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json(err);
    }
    return res.status(200).json(result);
  });
}

async function syncIntegrations(req, res) {
  let personasData;

  // Get Integrations
  const integrations = await new Promise((resolve, reject) => {
    IntegrationModel.getIntegrations((err, results) => {
      if (err) {
        console.error(err);
        return reject(new Error('Error occurred while reading the integrations data.'));
      }
      return resolve(results);
    });
  });
  console.log('results', integrations);

  // integrations.forEach(async (integration) => {
  //   if (integration.type === 'github') {
  //     personasData = await githubIntegration.generateAllPersonas(integration);
  //   } else if (integration.type === 'google') {
  //     personasData = await googleIntegration.generateAllPersonas(integration);
  //   }
  // });
  // await database.mergePersonas(personasData);
  
  personasData = await githubIntegration.generateAllPersonas(integrations[0]);
  personasData = await googleIntegration.generateAllPersonas();
  await database.mergePersonas(personasData);

  res.setHeader('Content-Type', 'application/json');
  res.json(personasData);
}

module.exports = {
  getIntegrations,
  addIntegration,
  deleteIntegration,
  syncIntegrations
};