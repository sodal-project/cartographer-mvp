// const {slackIntegration} = require('../integrations/slack.js');
const slackIntegration = require('../v1staging/modSlackIntegration.js')

const {githubIntegration} = require('../integrations/github.js');
const {googleIntegration} = require('../integrations/google.js'); 
const {herokuIntegration} = require('../integrations/heroku/heroku.js'); 
const {csvIntegration} = require('../integrations/csv.js');
const {clerkIntegration} = require('../integrations/clerk/clerk.js');
const {cache} = require('../utils/cache.js');
const {database} = require('../utils/database.js'); 
const {Persona} = require('../utils/persona.js'); 

const IntegrationModel = require('../models/integrationModel');
const { awsIntegration } = require('../integrations/aws.js');

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
  if (data.type === 'aws') {
    data.accessKeyId = req.body.accessKeyId
    data.secretAccessKey = req.body.secretAccessKey
  } else if (data.type === 'csv') {
    data.file = req.file?.filename
  } else if (data.type === 'github') {
    data.token = req.body.token
  } else if (data.type === 'google') {
    data.customer = req.body.customer
    data.subjectEmail = req.body.subjectEmail
    data.workspaceName = req.body.workspaceName
    data.file = req.file?.filename
  } else if (data.type === 'heroku') {
    data.apiKey = req.body.apiKey
  } else if (data.type === 'clerk') {
    data.apiKey = req.body.apiKey
  } else if (data.type === 'slack') {
    data.teamId = req.body.teamId
    data.token = req.body.token
  }

  // Errors
  let errors = [];
  if (!data.name) {
    errors.push('The Name field cannot be blank');
  }
  if (data.type === 'aws') {
    if (!data.accessKeyId) {
      errors.push('The Access Key Id field cannot be blank');
    }
    if (!data.secretAccessKey) {
      errors.push('The Secret Access Key field cannot be blank');
    }
  } else if (data.type === 'csv') {
    if (!data.file) {
      errors.push('The File field cannot be empty');
    }
  } else if (data.type === 'github') {
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
  } else if (data.type === 'Heroku') {
    if (!data.token) {
      errors.push('The API Key field cannot be blank');
    }
  } else if (data.type === 'Clerk') {
    if (!data.token) {
      errors.push('The API Key field cannot be blank');
    }
  } else if (data.type === 'slack') {
    if (!data.teamId) {
      errors.push('The Team ID field cannot be blank');
    }
    if (!data.token) {
      errors.push('The Token field cannot be blank');
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
    if (integration.type === 'aws') {
      return awsIntegration.generateAllPersonas(integration);
    } else if (integration.type === 'github') {
      return githubIntegration.generateAllPersonas(integration);
    } else if (integration.type === 'google') {
      return googleIntegration.generateAllPersonas(integration);
    } else if (integration.type === 'heroku') {
      return herokuIntegration.generateAllPersonas(integration);
    } else if (integration.type === 'slack') {
      return slackIntegration.mergeSync(integration);
    } else if (integration.type === 'csv') {
      return csvIntegration.generateAllPersonas(integration);
    } else if (integration.type === 'clerk') {
      return clerkIntegration.generateAllPersonas(integration);
    }
    return null;
  });
  personasData = await Promise.all(generatePersonasPromises);
  
  // V1: Integrations will handle database merges directly
  // 
  // await cache.save('allPersonas', Persona.localStore);
  // await database.mergePersonas(Persona.localStore);

  res.setHeader('Content-Type', 'application/json');
  res.json();
}

module.exports = {
  getIntegrations,
  addIntegration,
  deleteIntegration,
  syncIntegrations
};