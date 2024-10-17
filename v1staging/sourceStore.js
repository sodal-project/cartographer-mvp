const utilPersona = require('./persona');
const utilGraph = require('./graph');
const check = require('./check');

//
// Public Calls
//

const newStore = (source) => {
  check.sourceObject(source);
  const store = {
    source: source,
    personas: {},
  };
  return store;
}

const readStore = async (sourceId) => {

  const source = await utilGraph.readSource(sourceId);
  const graphPersonas = await utilGraph.readSourcePersonas(sourceId);
  const graphRelationships = await utilGraph.readSourceRelationships(sourceId);
  let store = newStore(source);

  store = addPersonas(store, graphPersonas);
  store = addRelationships(store, graphRelationships);

  return store;
}

const addPersonas = (store, personas) => {
  for(const persona of personas) {
    check.personaObject(persona);
    addPersona(store, persona);
  }
  return store;
}

const getMergeQueries = (store) => {

  check.sourceStoreObject(store);

  console.log(`Processing ${store.source.name} store`);
  console.log(`Found ${Object.keys(store.personas).length} personas`);

  const sourceQuery = getSourceQuery(store);
  const personaQueries = getSourcePersonaQueries(store);
  const declareQueries = getSourceDeclareQueries(store);
  const controlQueries = getStoreControlQueries(store);

  const queries = [
    sourceQuery,
    ...personaQueries,
    ...declareQueries,
    ...controlQueries,
  ]
  console.log(`Processed 
    ${personaQueries.length} persona queries,
    ${declareQueries.length} declare queries,
    ${controlQueries.length} control queries
    `);
  console.log(`Merge with ${queries.length} queries`);

  return queries;
}

const getMergeSyncQueries = (storeNew, storeOld) => {
  if(!storeOld) {
    console.log("Cannot merge with null store, executing non-sync merge.");
    return getMergeQueries(storeNew);
  }
  check.sourceStoreObject(storeNew);
  check.sourceStoreObject(storeOld);
  if(storeNew.source.id !== storeOld.source.id) {
    console.error("Cannot merge stores with different sources.");
    return [];
  }
  const sourceId = storeNew.source.id;

  let queries = [];
  queries.push(getSourceQuery(storeNew));

  let oldUpns = Object.keys(storeOld.personas);
  for(const upn in storeNew.personas) {
    const personaNew = storeNew.personas[upn];
    const personaOld = storeOld.personas[upn];

    if(oldUpns.includes(upn)) {
      const syncPersonaQuery = getSyncPersonaQuery(personaNew, personaOld)
      if(syncPersonaQuery) { queries.push(syncPersonaQuery); }
      queries = queries.concat(getSyncControlQueries(sourceId, personaNew, personaOld));

      oldUpns = oldUpns.filter((oldUpn) => oldUpn !== upn);
    } else {
      queries.push(getPersonaQuery(personaNew));
      queries = queries.concat(getControlQueries(sourceId, personaNew));
    }
  }
  for(const upn of oldUpns) {
    queries.push(getUndeclarePersonaQuery(upn));
    queries = queries.concat(getUndeclareControlQuery(upn));
  }
  console.log(`Merge Sync with ${queries.length} queries`);
  return queries;
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
  const storePersona = forcePersona(store, upn);

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
  store.personas[upn] = storePersona;

  const newRels = utilPersona.getRelationships(persona);
  store = addRelationships(store, newRels);

  return store;
}

const addRelationships = (store, relationships) => {

  for(const relationship of relationships) {
    // skip if source is not the same as the store
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

//
// Merge Queries
//

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

  for(const upn in store.personas) {
    queries.push(getDeclareQuery(store.source.id, upn));
  }
  return queries;
}

const getDeclareQuery = (sourceId, upn) => {
  return {
    query: `MATCH (source:Source { id: $sourceId }), (persona:Persona { upn: $upn })
  MERGE (source)-[rel:DECLARE]->(persona)
  `,
    values: {
      sourceId: sourceId,
      upn: upn,
    }
  }
}

const getSourcePersonaQueries = (store) => {
  const queries = [];
  for(const upn in store.personas) {
    queries.push(getPersonaQuery(store.personas[upn]));
  }
  return queries;
}

const getPersonaQuery = (persona) => { 
  const query = `MERGE (persona:Persona { upn: $upn })
    SET persona += $personaProps
    `
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

  return {
    query: query,
    values: {
      upn: persona.upn,
      personaProps: props,
    }
  }
}

const getStoreControlQueries = (store) => {
  let queries = [];

  for(const upn in store.personas) {
    queries = queries.concat(getControlQueries(store.source.id, store.personas[upn]));
  }
  return queries;
}

const getControlQueries = (sourceId, persona) => {
  const queries = [];
  for(const obeyUpn in persona.control) {
    queries.push(getControlQuery(sourceId, persona.upn, obeyUpn, persona.control[obeyUpn]));
  }
  return queries;
}

const getControlQuery = (sourceId, controlUpn, obeyUpn, relProps) => {
  relProps.sourceId = sourceId;
  return {
    query: `MATCH (control:Persona { upn: $controlUpn }), (obey:Persona { upn: $obeyUpn })
    MERGE (control)-[rel:CONTROL]->(obey)
    SET rel += $relProps
    `,
    values: {
      controlUpn: controlUpn,
      obeyUpn: obeyUpn,
      relProps: relProps,
    }
  }
}

//
// Merge Sync Queries
//

const getSyncPersonaQuery = (personaNew, personaOld) => {
  const query = `MATCH (persona:Persona { upn: $upn })
    SET persona += $personaProps
    `
  const props = {};

  for(const prop in personaNew) {
    switch(prop) {
      case "control":
      case "obey":
      case "upn":
        break;
      default:
        if(personaNew[prop] !== personaOld[prop]) {
          props[prop] = personaNew[prop];
        }
        break;
    }
  }

  // TODO: handle per-source persona property removal
  // check for explicitly removed properties
  // for(const prop in personaOld) {
  //   if(personaOld[prop] === "") {
  //    props[prop] = null;
  //  }
  // }
  
  if(Object.keys(props).length === 0) { 
    return null; 
  } else {
    return {
      query: query,
      values: {
        upn: personaNew.upn,
        personaProps: props,
      }
    }
  }
}

const getSyncControlQueries = (sourceId, personaNew, personaOld) => {
  let queries = [];

  let controlRelOldUpns = Object.keys(personaOld.control);
  
  for(const obeyUpn in personaNew.control) {
    const controlRelNew = personaNew.control[obeyUpn];
    const controlRelOld = personaOld.control[obeyUpn];

    if(!controlRelOld) {
      queries.push(getControlQuery(sourceId, personaNew.upn, obeyUpn, controlRelNew));
    } else {
      const relProps = {};
      for(const prop in controlRelNew) {
        if(prop === "sourceId") { continue; }
        if(controlRelNew[prop] !== controlRelOld[prop]) {
          relProps[prop] = controlRelNew[prop];
        }
      }
      for(const prop in controlRelOld) {
        if(prop === "sourceId") { continue; }
        if(controlRelNew[prop] === undefined) {
          relProps[prop] = null;
        }
      }
      controlRelOldUpns = controlRelOldUpns.filter((upn) => upn !== obeyUpn);
      if(Object.keys(relProps).length > 0) {
        queries.push(getControlQuery(sourceId, personaNew.upn, obeyUpn, relProps));
      }
    }
  }
  for(const controlRelOldUpn of controlRelOldUpns) {
    queries.push(getRemoveControlQuery(sourceId, personaNew.upn, controlRelOldUpn));
  }
  return queries;
}

const getUndeclarePersonaQuery = (sourceId, upn) => {
  const query = `MATCH (source:Source { id: $sourceId })-[rel:DECLARE]->(persona:Persona { upn: $upn })
    DELETE rel
    `
  return {query, values: {sourceId, upn}};
}

const getUndeclareControlQuery = (sourceId, upn) => {
  const query = `MATCH (persona:Persona { upn: $upn })-[rel:CONTROL]-(:Persona)
    WHERE rel.sourceId = $sourceId
    AND persona.upn = $upn
    DELETE rel
    `
  return {query, values: {sourceId, upn}};
}

const getRemoveControlQuery = (sourceId, controlUpn, obeyUpn) => {
  const query = `MATCH (control:Persona { upn: $controlUpn })-[rel:CONTROL]->(obey:Persona { upn: $obeyUpn })
    WHERE rel.sourceId = $sourceId
    DELETE rel
    `
  return {query, values: {sourceId, controlUpn, obeyUpn}};
}

module.exports = {
  newStore,
  readStore,
  addPersonas,
  getMergeQueries,
  getMergeSyncQueries,
}