const CC = require('./utilConstants');
const utilPersona = require('./utilPersona');

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

const addPersonas = (store, personas) => {
  for(const persona of personas) {
    addPersona(store, persona);
  }
  return store;
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

//
// Private Utils
//

const forcePersona = (store, upn) => {
  if(!store.personas[upn]) {
    const tempPersona = utilPersona.newFromUpn(upn);
    const storePersona = {
      upn: upn,
      type: tempPersona.type,
      platform: tempPersona.platform,
      id: tempPersona.id,
      control: {},
    }
    store.personas[upn] = storePersona;
  }
  return store.personas[upn];
}

const addPersona = (store, persona) => {
  const upn = persona.upn;
  if(!upn) { 
    console.error("Persona missing UPN, cannot add to store.");
    return store;
  }

  const storePersona = forcePersona(store, upn);

  // if the persona does exist, update it
  const newRels = utilPersona.getRelationships(persona);
  addRelationships(store, newRels);

  for(const key in persona) {
    // if the property doesn't exist, add it
    if(!storePersona[key]) {
      switch(key) {
        case "control":
        case "obey":
          break;
        default:
          storePersona[key] = persona[key];
          break;
      }
    } 
  }
  return store;
}

const addRelationships = (store, relationships) => {

  for(const relationship of relationships) {
    // skip if source is NOT the same as the store
    if(relationship.sourceId && relationship.sourceId !== store.source.id) { continue; }

    const controlUpn = relationship.controlUpn;
    const obeyUpn = relationship.obeyUpn;

    delete relationship.controlUpn;
    delete relationship.obeyUpn;
    delete relationship.sourceId;

    const subordinatePersona = forcePersona(store, obeyUpn);
    const controlPersona = forcePersona(store, controlUpn);

    // add relationship if it doesn't already exist, or is lower confidence
    const confidence = relationship.confidence;
    if(!controlPersona.control[obeyUpn] || confidence > controlPersona.control[obeyUpn].confidence) {
      controlPersona.control[obeyUpn] = relationship;
    }
  }
  return store;
}

module.exports = {
  newStore,
  read,
  addPersonas,
  compare,
  merge,
  mergeSync,
}