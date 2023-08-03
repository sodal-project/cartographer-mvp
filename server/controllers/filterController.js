const FilterModel = require('../models/filterModel');

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

const getFilter = async (req, res) => {
  const filterQuery = decodeURIComponent(req.query.filterQuery);
  const databaseCall = FilterModel.getFilter(filterQuery);
  respond(res, databaseCall);
}

module.exports = {
  getFilter,
}