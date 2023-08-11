const FilterSetModel = require('../models/discoverySetModel');

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

const getFilterSet = async (req, res) => {
  const filterSetId = decodeURIComponent(req.query.filterSetId);
  const databaseCall = FilterSetModel.getFilterSet(filterSetId);
  respond(res, databaseCall);
}

const saveFilterSet = async (req, res) => {
  const query = req.body.query;
  const name = req.body.name;
  const id = req.body.id;
  const databaseCall = FilterSetModel.saveFilterSet(query, name, id);
  respond(res, databaseCall);
}

module.exports = {
  getFilterSet,
  saveFilterSet,
}