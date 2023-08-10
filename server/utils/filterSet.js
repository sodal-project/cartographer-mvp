var localStore = {};
var referencedSets = [];
var idCounter = 0;

const nextId = () => {
  nextId = getMaxId() + 1;
  console.log("Next FilterSet id: " + nextId);
  return nextId;
}

const getMaxId = () => {
  const ids = Object.values(localStore).map(fs => fs.id);
  return Math.max(...ids);
}

const getSet = (id) => {
  return localStore[id];
}

const getAllSets = () => {
  return localStore;
}

const refreshAllReferencedSets = () => {
  const allSets = Object.values(localStore).map(fs => fs.referencedSets);
  referencedSets = [...new Set(allSets.flat())];
  console.log("Found " + referencedSets.length + " total referenced sets.");
  return referencedSets;
}

const saveSet = (filterSet) => {
  localStore[filterSet.id] = filterSet;
  refreshAllReferencedSets();
}

const importSets = (sets) => {
  localStore = sets;
  idCounter = getMaxId();
  refreshAllReferencedSets();
}

const deleteSet = (id) => {
  delete localStore[id];
  refreshAllReferencedSets();
}

module.exports = { 
  nextId,
  getSet,
  getAllSets,
  saveSet,
  importSets,
  deleteSet,
  referencedSets: referencedSets,
 };