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
  return await updateSet(id, name, query);
}

const listSets = () => {
  const allSets = discoverySet.getAllSets();
  // convert to array
  const setArray = [];
  for(let i in allSets){
    setArray.push(allSets[i]);
  }
  return setArray;
}

const deleteSet = async (id) => {
  if(discoverySet.referencedSets.includes(id)){
    throw "Cannot delete a set that is referenced by another set.";
  }
  discoverySet.deleteSet(id);
  await saveStore();
}

const initialize = async (newStore) => {
  console.log("Initializing filter sets...");
  discoverySet.purge();
  if(!newStore){
    // load cached sets
    newStore = await cache.load(saveName, saveFolder);
    if(!newStore){
      // load default sets
      newStore = discoveryDefaultSets.defaultSets;
      if(!newStore){
        throw "Could not load filter sets."
      }
    }
  }
  await loadSets(newStore);
}

const loadSets = async (setStore) => {
  console.log("Loading filter sets...");
  for(let i in setStore){
    const savedSet = setStore[i];
    await updateSet(savedSet.id, savedSet.name, savedSet.subset, false);
  }
  const allSets = discoverySet.getAllSets();
  console.log("Loaded " + Object.keys(allSets).length + " sets.");
  saveStore();
}

const createSet = async (name, query) => {
  const id = discoverySet.getNextId();
  return await updateSet(id, name, query);
}

const updateSet = async (id, name, query, save = true) => {
  const innerSets = getSetIdsInQuery(query);
  if(innerSets.includes(id)){ throw "Query set cannot be self-referencing."; }

  const output = await discoveryRunner.getQueryArrayUpns(query);

  const curSet = {
    id: id,
    name: name,
    subset: query,
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
    } else if(filter.type === "filterControl" || filter.type === "filterMatch"){
      const innerSets = getSetIdsInQuery(filter.query);
      results.concat(innerSets);
    }
  }
  return [...new Set(results)];
}

module.exports = {
  initialize,
  getSet,
  listSets,
  deleteSet,
  createSet,
  updateSet,
};