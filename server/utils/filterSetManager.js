const filterSet = require('../utils/filterSet.js');
const filterQueryBuilder = require('../utils/filterQueryBuilder.js');
const { database } = require('../utils/database.js');
const { cache } = require('../utils/cache.js');

const saveFolder = "filterSets";
const saveName = "filterSets";
const defaultSets = {
  0: {
    id: 0,
    name: "All Github Owner Accounts",
    query: [
      {
        type: "filterField",
        name: "type",
        value: "account",
        not: false,
        compareType: "=",
      },
      {
        type: "filterField",
        name: "platform",
        value: "github",
        not: false,
        compareType: "=",
      },
      {
        type: "filterControl",
        direction: "CONTROL",
        rel: ["superadmin"],
        subset: [
          {
            type: "filterField",
            name: "type",
            value: "organization",
            not: false,
            compareType: "=",
          },
        ]
      }
    ],
    referenceSets: [],
  }
}

const initialize = async (newStore) => {
  let setStore = {};
  if(newStore){
    setStore = newStore;
  } else {
    setStore = await cache.load(saveName, saveFolder);
  }

  if(!setStore){
    throw "Could not load filter sets."
  }

  for(let i in setStore){
    const savedSet = setStore[i];
    await updateSet(savedSet.id, savedSet.name, savedSet.query, false);
  }
  const allSets = filterSet.getAllSets();
  console.log("Loaded " + Object.keys(allSets).length + " sets.");
  saveStore();
}

const saveStore = async () => {
  const fileStore = filterSet.getAllSets();
  await cache.save(saveName, fileStore, saveFolder);
  console.log("Saved " + Object.keys(fileStore).length + " sets.");
}

const createSet = async (name, query) => {
  const id = filterSet.nextId();
  return updateSet(id, name, query);
}

const updateSet = async (id, name, query, save = true) => {
  const innerSets = getSetIdsInQuery(query);
  if(innerSets.includes(id)){ throw "Query set cannot be self-referencing."; }

  const cypher = filterQueryBuilder.getCypherFromQueryArray(query);
  const output = await getQueryOutputUpns(cypher);

  const curSet = {
    id: id,
    name: name,
    query: query,
    referencedSets: innerSets,
    output: output,
  }

  filterSet.saveSet(curSet);

  if(save) {
    await saveStore();
  }

  return curSet;
}

const getSetIdsInQuery = (query) => {
  const results = [];
  for(let q in query){
    const filter = query[q];
    if(filter.type === "filterSet"){
      results.push(item.setId);
      const innerSets = filterSet.getSet(filter.setId).referencedSets;
      results.concat(innerSets);
    } else if(filter.type === "filterControl" || filter.type === "filerMatch"){
      const innerSets = getSetIdsInQuery(filter.query);
      results.concat(innerSets);
    }
  }
  return [...new Set(results)];
}

const deleteSet = async (id) => {
  if(filterSet.referencedSets.includes(id)){
    throw "Cannot delete a set that is referenced by another set.";
  }
  filterSet.deleteSet(id);
  await saveStore();
}

const listSets = () => {
  return filterSet.getAllSets();
}

const getQueryOutputUpns = async (cypher) => {
  const result = await database.dbQuery(cypher);
  const records = result.records;
  const upns = [];
  for(let i in records){
    const record = records[i]._fields[0].properties.upn;
    upns.push(record);
  }
  return upns;
}

module.exports = {
  initialize,
  createSet,
  updateSet,
  listSets,
  deleteSet,
};

// initialize(defaultSets);