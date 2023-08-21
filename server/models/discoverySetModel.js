const discoverySet = require('../utils/discoverySet.js');
const discoveryRunner = require('../utils/discoveryRunner.js');
const discoveryDefaultSets = require('../utils/discoveryDefaultSets.js')
const { cache } = require('../utils/cache.js');

const saveFolder = "sets";
const saveName = "sets";

const getSet = async (filterId) => {
  return discoverySet.getSet(filterId);
}

const saveSet = async (id, name, query) => {
  return updateSet(id, name, query);
}

const listSets = () => {
  return discoverySet.getAllSets();
}

const deleteSet = async (id) => {
  if(discoverySet.referencedSets.includes(id)){
    throw "Cannot delete a set that is referenced by another set.";
  }
  discoverySet.deleteSet(id);
  await saveStore();
}

const initialize = async (newStore) => {
  let setStore = {};
  if(newStore){
    setStore = newStore;
  } else {
    setStore = await cache.load(saveName, saveFolder);
    if(!setStore){
      setStore = initialize(discoveryDefaultSets);
    }
  }

  if(!setStore){
    throw "Could not load filter sets."
  }

  for(let i in setStore){
    const savedSet = setStore[i];
    await updateSet(savedSet.id, savedSet.name, savedSet.query, false);
  }
  const allSets = discoverySet.getAllSets();
  console.log("Loaded " + Object.keys(allSets).length + " sets.");
  saveStore();
}

const createSet = async (name, query) => {
  const id = discoverySet.nextId();
  return updateSet(id, name, query);
}

const updateSet = async (id, name, query, save = true) => {
  const innerSets = getSetIdsInQuery(query);
  if(innerSets.includes(id)){ throw "Query set cannot be self-referencing."; }

  const output = await discoveryRunner.runQueryArray(query);

  const curSet = {
    id: id,
    name: name,
    query: query,
    referencedSets: innerSets,
    output: output,
  }

  discoverySet.saveSet(curSet);

  if(save) {
    await saveStore();
  }

  return curSet;
}

const saveStore = async () => {
  const fileStore = discoverySet.getAllSets();
  await cache.save(saveName, fileStore, saveFolder);
  console.log("Saved " + Object.keys(fileStore).length + " sets.");
}

const getSetIdsInQuery = (query) => {
  const results = [];
  for(let q in query){
    const filter = query[q];
    if(filter.type === "filterSet"){
      results.push(item.setId);
      const innerSets = discoverySet.getSet(filter.setId).referencedSets;
      results.concat(innerSets);
    } else if(filter.type === "filterControl" || filter.type === "filerMatch"){
      const innerSets = getSetIdsInQuery(filter.query);
      results.concat(innerSets);
    }
  }
  return [...new Set(results)];
}

module.exports = {
  initialize,
  getSet,
  saveSet,
  deleteSet,
};