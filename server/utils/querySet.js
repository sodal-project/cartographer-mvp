const { cache } = require("./cache");

const QuerySet = {
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

const saveFolder = "querysets";
const saveName = "querysets.json";
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

QuerySet.getSetIdsInQuery = (query) => {
  const results = [];
  for(let q in query){
    const filter = query[q];
    if(filter.type === "filterSet"){
      results.push(item.setId);
      const innerSets = QuerySet.getSet(filter.setId).referencedSets;
      results.concat(innerSets);
    } else if(filter.type === "filterControl" || filter.type === "filerMatch"){
      const innerSets = getSetIdsInQuery(filter.query);
      results.concat(innerSets);
    }
  }
  return [...new Set(results)];
}

QuerySet.nextId = () => {
  return QuerySet.id++;
}

QuerySet.getSet = (id) => {
  return localStore[id];
}

QuerySet.getAllSets = () => {
  return localStore;
}

QuerySet.newSet = (name, query) => {
  const newSet = {
    id: QuerySet.nextId(),
    name: name,
    query: query,
    referencedSets: QuerySet.getSetIdsInQuery(query),
  }
  Config.localStore[newSet.id] = newSet;
  Config.saveSets();
  return newSet;
}

QuerySet.updateSet = (id, name, query) => {
  const innerSets = QuerySet.getSetIdsInQuery(query);
  if(innerSets.includes(id)){
    throw "Query set cannot be self-referencing. Consider saving as new set instead.";
  }
  const set = QuerySet.getSet(id);
  set.name = name;
  set.query = query;
  set.referencedSets = innerSets;
}

module.exports = { QuerySet };