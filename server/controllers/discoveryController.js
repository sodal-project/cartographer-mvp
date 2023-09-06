const DiscoveryModel = require('../models/discoveryModel');

function getSet(req, res) {
  const itemId = req.params.setid;
  DiscoveryModel.getSet(itemId, (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json(err);
    }
    return res.status(200).json(result);
  });
}

function getSets(req, res) {
  DiscoveryModel.getSets((err, sets) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Error occurred while reading the sets data.' });
    }
    return res.status(200).json(sets);
  });
}

function addSet(req, res) {
  const data = {
    setid: req.body.setid,
    name: req.body.name,
    subset: req.body.subset,
  };

  // Errors
  let errors = [];
  if (!data.name) {
    errors.push('The set needs a name');
  }
  if (errors.length > 0) {
    res.status(400).json({ errors: errors });
    return;
  }

  DiscoveryModel.addSet(data, (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json(err);
    }
    return res.status(200).json(result);
  });
}

function deleteSet(req, res) {
  const itemId = req.params.setid;
  DiscoveryModel.deleteSet(itemId, (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json(err);
    }
    return res.status(200).json(result);
  });
}

module.exports = {
  getSet,
  getSets,
  addSet,
  deleteSet,
};
