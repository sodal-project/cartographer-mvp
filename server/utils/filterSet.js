const FilterSet = {
  Properties: {
    id: 0,
    name: "String",
    query: [],
    referencedSets: [], // includes all Sets w/ referenced Sets
    output: [], // stored when saved
  },
  id: 1,
  referencedSets: [],
  localStore: {},
}

const nextId = () => {
  nextId = getMaxId() + 1;
  console.log("Next FilterSet id: " + nextId);
  return nextId;
}

const getMaxId = () => {
  const ids = Object.values(FilterSet.localStore).map(fs => fs.id);
  return Math.max(...ids);
}

const getSet = (id) => {
  return FilterSet.localStore[id];
}

const getAllSets = () => {
  return FilterSet.localStore;
}

const refreshAllReferencedSets = () => {
  const allSets = Object.values(FilterSet.localStore).map(fs => fs.referencedSets);
  FilterSet.referencedSets = [...new Set(allSets.flat())];
  console.log("Found " + FilterSet.referencedSets.length + " total referenced sets.");
  return FilterSet.referencedSets;
}

const saveSet = (filterSet) => {
  FilterSet.localStore[filterSet.id] = filterSet;
  refreshAllReferencedSets();
}

const importSets = (sets) => {
  FilterSet.localStore = sets;
  FilterSet.id = getMaxId();
  refreshAllReferencedSets();
}

const deleteSet = (id) => {
  delete FilterSet.localStore[id];
  refreshAllReferencedSets();
}

module.exports = { 
  nextId,
  getSet,
  getAllSets,
  saveSet,
  importSets,
  deleteSet,
  referencedSets: FilterSet.referencedSets,
 };