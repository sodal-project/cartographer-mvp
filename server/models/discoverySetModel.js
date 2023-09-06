// const discoveryRunner = require('../utils/discoveryRunner.js');
const discoveryDefaultSets = require('../utils/discoveryDefaultSets.js')
const { cache } = require('../utils/cache.js');

const saveFolder = "sets";
const saveName = "sets";

const getSet = async (filterId) => {
  const localStore = await initialize();
  return localStore[filterId];
}

const listSets = async () => {
  const localStore = await initialize();
  // convert to array
  const setArray = [];
  for(let i in localStore){
    setArray.push(localStore[i]);
  }
  return setArray;
}

const deleteSet = async (setid) => {
  console.log("Deleting set " + setid + "...");
  let localStore = await initialize();
  const referencedSets = getAllReferencedSets(localStore);
  if(referencedSets.includes(setid)){
    console.log("Cannot delete a set that is referenced by another set.");
  } else {
    delete localStore[setid];
    await saveStore(localStore);
    console.log("Deleted set " + setid + ".");
  }
}

const saveSet = async (discoverySet) => {
  const localStore = await initialize();
  const updatedSet = await updateSet(discoverySet, localStore)
  await saveStore(localStore);
  return updatedSet;
}

const initialize = async () => {
  console.log("Initializing filter sets...");
  let localStore = await cache.load(saveName, saveFolder);
  //if(!localStore){
    // load default sets
    // localStore = discoveryDefaultSets.defaultSets;
    // if(!localStore){
    //   throw "Could not load filter sets."
    // }
  // }
  return await processSets(localStore);
}

const processSets = async (localStore) => {
  console.log("Processing discovery sets...");
  for(let i in localStore){
    const savedSet = localStore[i];
    await updateSet(savedSet, localStore);
  }
  console.log("Processed " + Object.keys(localStore).length + " sets.");
  saveStore(localStore);
  return localStore;
}

const updateSet = async (discoverySet, localStore) => {
  if(!discoverySet || !localStore) {
    console.log("Must provide set and localStore to update.");
    return;
  }

  if(discoverySet.setid === null || discoverySet.setid === undefined){ 
    discoverySet.setid = getNextId(localStore);
  }

  const innerSets = await getSetIdsInQuery(discoverySet.subset, localStore);

  if(innerSets.includes(discoverySet.setid)){ 
    console.log("Query set cannot be self-referencing.")
    return
  }
  discoverySet.referencedSets = innerSets;

  localStore[discoverySet.setid] = discoverySet;

  return discoverySet;
}

const saveStore = async (localStore) => {
  await cache.save(saveName, localStore, saveFolder);
  console.log("Saved " + Object.keys(localStore).length + " sets.");
}

const getSetIdsInQuery = async (query, localStore) => {
  const results = [];

  for(let q in query){
    const filter = query[q];
    if(filter.type === "filterSet"){
      results.push(item.setId);
      const innerSets = localStore[filter.setId].referencedSets;
      results.concat(innerSets);
    } else if(filter.type === "filterControl" || filter.type === "filterMatch"){
      const innerSets = await getSetIdsInQuery(filter.subset, localStore);
      results.concat(innerSets);
    }
  }
  return [...new Set(results)];
}

const getAllReferencedSets = (localStore) => {
  const allSets = Object.values(localStore).map(fs => fs.referencedSets);
  const referencedSets = [...new Set(allSets.flat())];
  console.log("Found " + referencedSets.length + " total referenced sets.");
  return referencedSets;
}

const getNextId = (localStore) => {
  const setids = Object.values(localStore).map(fs => fs.setid);
  nextId = Math.max(...setids) + 1;
  return nextId;
}

module.exports = {
  getSet,
  listSets,
  deleteSet,
  saveSet,
};