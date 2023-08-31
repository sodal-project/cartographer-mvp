var localStore = {};
var referencedSets = [];
var nextId = 0;

const getNextId = () => {
  return nextId++;
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

const saveSet = (discoverySet) => {
  if(!discoverySet.id){
    discoverySet.id = getNextId();
  }
  localStore[discoverySet.id] = discoverySet;
  refreshAllReferencedSets();
}

const importSets = (sets) => {
  localStore = sets;
  const ids = Object.values(localStore).map(fs => fs.id);
  nextId = Math.max(...ids) + 1;
  refreshAllReferencedSets();
}

const deleteSet = (id) => {
  delete localStore[id];
  refreshAllReferencedSets();
}

const purge = () => {
  localStore = {};
  referencedSets = [];
  nextId = 0;
}

module.exports = { 
  getSet,
  getAllSets,
  saveSet,
  importSets,
  deleteSet,
  purge,
  referencedSets: referencedSets,
 };