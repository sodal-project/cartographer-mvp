const { cache } = require("./cache");

const Set = {
  Properties: {
    id: 0,
    name: "String",
    query: [],
    count: 0,
    referencedSets: [], // includes all Sets w/ referenced Sets
    output: [], // Stored when saved
  },
  id: 0,
}

const saveFolder = "sets";
const saveName = "sets.json";
const localStore = {};

const loadSets = async () => {
  localStore = await cache.load(saveName, saveFolder);
  Set.id = Object.keys(localStore).length;
  console.log("Loaded " + Object.keys(localStore).length + " sets.");
}

const saveSets = async () => {
  await cache.save(saveName, localStore, saveFolder);
  console.log("Saved " + Object.keys(localStore).length + " sets.");
}

Set.getSetIdsInQuery = (query) => {
  const results = [];
  for(let q in query){
    const filter = query[q];
    if(filter.type === "filterSet"){
      results.push(item.setId);
      const innerSets = Set.getSet(filter.setId).referencedSets;
      results.concat(innerSets);
    } else if(filter.type === "filterControl" || filter.type === "filerMatch"){
      const innerSets = getSetIdsInQuery(filter.query);
      results.concat(innerSets);
    }
  }
  return results;
}

Set.nextId = () => {
  return Set.id++;
}

Set.getSet = (id) => {
  return localStore[id];
}

Set.getAllSets = () => {
  return localStore;
}

Set.newSet = (name, query) => {
  const newSet = {
    id: Set.nextId(),
    name: name,
    query: query,
    referencedSets: Set.getSetIdsInQuery(query),
  }
  Config.localStore[newSet.id] = newSet;
  Config.saveSets();
  return newSet;
}

Set.updateSet = (id, name, query) => {
  if(Set.getSetIdsInQuery(query).includes(id)){
    throw "Query set cannot be self-referencing.";
  }
  const set = Set.getSet(id);
  set.name = name;
  set.query = query;
}

module.exports = { Set };