const utilPersona = require('./utilPersona');

//
// Public Calls
//

const newStore = (source) => {
  const store = {
    source: source,
    personas: {},
  };
  return store;
}

const rebuild = (sourcePersonas, sourceRelationships) => {
  
}

const addPersonas = (store, personas) => {
  for(const persona of personas) {
    addPersona(store, persona);
  }
  return store;
}

const getMergeQueries = (store) => {
  const sourceQuery = getSourceQuery(store);
  const personaQueries = getPersonaQueries(store);
  const declareQueries = getSourceDeclareQueries(store);
  const relationshipQueries = getRelationshipQueries(store);

  const queries = [
    sourceQuery,
    ...personaQueries,
    ...declareQueries,
    ...relationshipQueries,
  ]

  console.log(`Merge with ${queries.length} queries`);

  return queries;
}

const getMergeSyncQueries = (store) => {
  // compare localStore to SourceStore

  // process differences
}

//
// Private Utils
//

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

const getSourceQuery = (store) => {
  const query = `MERGE (source:Source { id: $sourceId })
    SET source += $sourceProps
    `
  const values = {
    sourceId: store.source.id,
    sourceProps: {
      name: store.source.name,
      lastUpdate: String(store.source.lastUpdate),
    }
  }
  return {query, values};
}

const getSourceDeclareQueries = (store) => {
  const queries = [];
  const query = `MATCH (source:Source { id: $sourceId }), (persona:Persona { upn: $upn })
  MERGE (source)-[rel:DECLARE]->(persona)
  `

  for(const upn in store.personas) {
    querySet = {
      query: query,
      values: {
        sourceId: store.source.id,
        upn: upn,
      }
    }
    queries.push(querySet);
  }
  return queries;
}

const getPersonaQueries = (store) => {
  const queries = [];
  const query = `MERGE (persona:Persona { upn: $upn })
    SET persona += $personaProps
    `

  for(const upn in store.personas) {
    const persona = store.personas[upn];
    const props = {};

    for(const prop in persona) {
      switch(prop) {
        case "control":
        case "obey":
        case "upn":
          break;
        default:
          props[prop] = persona[prop];
          break;
      }
    }

    querySet = {
      query: query,
      values: {
        upn: upn,
        personaProps: props,
      }
    }
    queries.push(querySet);
  }
  return queries;
}

const getRelationshipQueries = (store) => {
  const queries = [];
  const query = `MATCH (control:Persona { upn: $controlUpn }), (obey:Persona { upn: $obeyUpn })
  MERGE (control)-[rel:CONTROL]->(obey)
  SET rel += $relProps
  `

  for(const upn in store.personas) {
    const persona = store.personas[upn];
    for(const obeyUpn in persona.control) {
      queries.push({
        query: query,
        values: {
          controlUpn: upn,
          obeyUpn: obeyUpn,
          relProps: {...persona.control[obeyUpn]},
        }
      });
    }
  }
  return queries;
}

module.exports = {
  newStore,
  rebuild,
  addPersonas,
  getMergeQueries,
  getMergeSyncQueries,
}