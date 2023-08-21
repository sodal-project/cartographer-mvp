const DiscoverySetModel = require('../models/discoverySetModel');

const respond = async (res, databaseCall) => {
  try {
    const result = await databaseCall;
    res.setHeader('Content-Type', 'application/json');
    res.json(result);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

const getDiscoverySet = async (req, res) => {
  const setId = decodeURIComponent(req.query.setId);
  const databaseCall = DiscoverySetModel.getDiscoverySet(setId);
  respond(res, databaseCall);
}

const saveDiscoverySet = async (req, res) => {
  const query = req.body.query;
  const name = req.body.name;
  const id = req.body.id;
  const databaseCall = DiscoverySetModel.saveDiscoverySet(query, name, id);
  respond(res, databaseCall);
}

module.exports = {
  getDiscoverySet,
  saveDiscoverySet,
}