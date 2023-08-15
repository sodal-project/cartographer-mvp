const discoverySetManager = require("../utils/discoverySetManager.js");

const getDiscoverySet = async (filterId) => {
  return discoverySetManager.getSet(filterId);
}

const saveDiscoverySet = async (id, name, query) => {
  return discoverySetManager.updateSet(id, name, query);
}

module.exports = {
  getDiscoverySet,
  saveDiscoverySet,
};