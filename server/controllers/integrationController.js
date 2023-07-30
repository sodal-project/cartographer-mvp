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

module.exports = {
  getIntegrations,
  addIntegration,
  deleteIntegration,
};