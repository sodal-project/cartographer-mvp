const { cache } = require("./cache");

const Set = {
  Properties: {
    id: 0,
    name: "String",
    query: [{query}],
    count: 0,
    referencedSets: [], // includes all Sets w/ referenced Sets
    output: [], // Stored when saved
  },
}

const saveFolder = "sets";
const saveName = "sets.json";
const localStore = {};

const loadSets = async () => {
  await cache.load(saveName, saveFolder);
  console.log("Loaded " + Object.keys(localStore).length + " sets.");
}

const saveSets = async () => {
  await cache.save(saveName, localStore, saveFolder);
  console.log("Saved " + Object.keys(localStore).length + " sets.");
}

Set.nextId = () => {
  return Config.id++;
}

Set.getSet = (id) => {
  return Config.localStore[id];
}

Set.getSets = () => {
  return Config.localStore;
}

Set.saveSet = (name, query) => {
  const newSet = {
    id: Config.nextId(),
    name: name,
    query: query,
    referencedSets: [],
  }
  Config.localStore[newSet.id] = newSet;
  Config.saveSets();
  return newSet;
}

Set.updateSet = (id, name, query) => {
  const set = Set.getSet(id);
  set.name = name;
  set.query = query;
}

module.exports = { Set };