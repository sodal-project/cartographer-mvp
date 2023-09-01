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

const listSets = async (req, res) => {
  const databaseCall = DiscoverySetModel.listSets();
  respond(res, databaseCall);
}

const getSet = async (req, res) => {
  const setid = decodeURIComponent(req.query.setid);
  const databaseCall = DiscoverySetModel.getSet(setid);
  respond(res, databaseCall);
}

const saveSet = async (req, res) => {
  const curSet = {
    setid: req.body.setid,
    name: req.body.name,
    subset: req.body.query,
  }
  const databaseCall = DiscoverySetModel.saveSet(curSet);
  respond(res, databaseCall);
}

const deleteSet = async (req, res) => {
  const setid = decodeURIComponent(req.query.setid);
  const databaseCall = DiscoverySetModel.deleteSet(setid);
  respond(res, databaseCall);
}

module.exports = {
  getSet,
  saveSet,
  listSets,
  deleteSet,
}