const CC = require('./utilConstants');

//
// Public Calls
//

const newStore = (source) => {
  return {
    source: source,
    personas: {},
  };
}

// return object/array of all source-linked personas and control relationships
const read = async (upn) => {
  
}

const addPersona = (store, persona) => {
}

const compare = (store1, store2) => {
  results = {
    addedPersonas: [],
    addedControls: [],
    changedPersonas: [],
    changedControls: [],
    removedPersonas: [],
    removedControls: [],
  };
}

const merge = async (store) => {

}

const mergeSync = async (store) => {
  // compare localStore to SourceStore

  // process differences
}

module.exports = {
  newStore,
  read,
  addPersona,
  compare,
  merge,
  mergeSync,
}