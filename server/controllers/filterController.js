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
  const filterQueryObject = JSON.parse(filterQuery);
  const databaseCall = FilterModel.getFilter(filterQueryObject);
  respond(res, databaseCall);
}

function addFilter(req, res) {
  const data = req.filterQuery;

  // Error handling
  let errors = [];
  if (!data.filterQuery) {
    errors.push('Filter query cannot be blank');
  }
  if (errors.length > 0) {
    res.status(400).json({ errors: errors });
    return;
  }

  FilterModel.addFilter(data, (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json(err);
    }
    return res.status(200).json(result);
  });
}

module.exports = {
  addFilter,
  getFilter,
}