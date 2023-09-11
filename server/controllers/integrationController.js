const {githubIntegration} = require('../integrations/github.js');
const {googleIntegration} = require('../integrations/google.js'); // Assuming you have separate files for each integration
const {csvIntegration} = require('../integrations/csv.js');
const {slackIntegration} = require('../integrations/slack.js');
const {database} = require('../utils/database.js'); // Assuming you have a separate file for database operations
const {Persona} = require('../utils/persona.js'); 

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
    type: req.body.type,
  };
  if (data.type === 'github') {
    data.token = req.body.token
  } else if (data.type === 'google') {
    data.customer = req.body.customer
    data.subjectEmail = req.body.subjectEmail
    data.workspaceName = req.body.workspaceName
    data.file = req.file?.filename
  } else if (data.type === 'slack') {
    data.teamId = req.body.teamId
    data.token = req.body.token
  } else if (data.type === 'csv') {
    data.file = req.file?.filename
  }

  // Errors
  let errors = [];
  if (!data.name) {
    errors.push('The Name field cannot be blank');
  }
  if (data.type === 'github') {
    if (!data.token) {
      errors.push('The Token field cannot be blank');
    }
  } else if (data.type === 'google') {
    if (!data.customer) {
      errors.push('The Customer ID field cannot be blank');
    }
    if (!data.subjectEmail) {
      errors.push('The Subject Email field cannot be blank');
    }
    if (!data.workspaceName) {
      errors.push('The Wordspace Name field cannot be blank');
    }
    if (!data.file) {
      errors.push('The File field cannot be empty');
    }
  } else if (data.type === 'slack') {
    if (!data.teamId) {
      errors.push('The Team ID field cannot be blank');
    }
    if (!data.token) {
      errors.push('The Token field cannot be blank');
    }
  } else if (data.type === 'csv') {
    if (!data.file) {
      errors.push('The File field cannot be empty');
    }
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

  // Loop
  const generatePersonasPromises = integrations.map(async (integration) => {
    if (integration.type === 'github') {
      return githubIntegration.generateAllPersonas(integration);
    } else if (integration.type === 'google') {
      return googleIntegration.generateAllPersonas(integration);
    } else if (integration.type === 'slack') {
      return slackIntegration.generateAllPersonas(integration);
    } else if (integration.type === 'csv') {
      return csvIntegration.generateAllPersonas(integration);
    }
    return null;
  });
  personasData = await Promise.all(generatePersonasPromises);
  
  // Save
  // FIX: only merge once from the Persona localstore
  // const savePersonasPromises = personasData.map(async (personaData) => {
  //   await database.mergePersonas(personaData);
  // });
  // savePersonas = await Promise.all(savePersonasPromises);
  await database.mergePersonas(Persona.localStore);

  res.setHeader('Content-Type', 'application/json');
  res.json(personasData);
}

module.exports = {
  getIntegrations,
  addIntegration,
  deleteIntegration,
  syncIntegrations
};