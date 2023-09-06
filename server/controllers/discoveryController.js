const DiscoveryModel = require('../models/discoveryModel');

const hasUniqueSetIds = (data = []) => {
  const idSet = new Set(); // Create a Set to store encountered ids

  function traverse(item) {
    if (item.setid && idSet.has(item.setid)) {
      return false; // If the id is already in the Set, it's not unique
    } 
    idSet.add(item.setid);
    if (item.subset && Array.isArray(item.subset)) {
      for (const itemSubset of item.subset) {
        traverse(itemSubset);
      }
    }
    return true;
  }

  for (const item of data) {
    const unique = traverse(item);
    if (!unique) {
      return false;
    }
  }
  return true; // All ids are unique
}

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
  if (!hasUniqueSetIds(data.subset)) {
    errors.push('The set needs unique setids');
  }
  if (errors.length > 0) {
    console.log(errors)
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
