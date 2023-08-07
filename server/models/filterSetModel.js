const filterSetManager = require("../utils/filterSetManager.js");

const getFilterSet = async (filterId) => {
  return filterSetManager.getSet(filterId);
}

const saveFilterSet = async (id, name, query) => {
  return filterSetManager.updateSet(id, name, query);
}

const listFilterSets = async () => {
  return filterSetManager.listSets();
}

module.exports = {
  getFilterSet,
  listFilterSets,
  saveFilterSet,
};