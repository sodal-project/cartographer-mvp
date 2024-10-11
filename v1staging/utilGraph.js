
const CC = require('./utilConstants');
const persona = require('./utilPersona');
const queryBuilder = require('./utilGraphUtils');
const connector = require('./dbConnector');

const defaultPageParams = {
  page: 1,
  pageSize: 1500, 
  orderBy: "upn",
  orderByDirection: "ASC",
}

const defaultAccessLevels = [
  CC.LEVEL.ALIAS,
  CC.LEVEL.ADMIN,
  CC.LEVEL.MANAGE,
  CC.LEVEL.ACT_AS,
]

//
// READ
//

const readPersonaDeclarations = async (upn) => {

}

const readPersonaProperties = async (upn) => {

}

const getPersonaControl = async (upn, levels, recursive = false, pageParams) => {

}

const getPersonaObey = async (upn, levels, recursive = false, pageParams) => {

}

const readSourcePersonas = async (sourceId, pageParams) => {

}

const readSourceRelationships = async (sourceId, pageParams) => {

}

const readOrphanedPersonas = async (pageParams) => {

}

// persona property search
/*
filter: {
  props: {
    ids: [],
    upns: [],
    platforms: [],
    types: [],
  }
  obey: {
    levels: [],
    sources: [],
    min-confidence: 0,
    max-confidence: 1,
  }
  control: {
    levels: [],
    sources: [],
    min-confidence: 0,
    max-confidence: 1,
  }
  source: {
    ids: [],
    min-confidence: 0,
    max-confidence: 1,
  }
}

*/
const readFilter = async (filter, pageParams) => {

}

//
// WRITE 
//

// add or update persona custom properties
const mergePersonaDeclaration = async (sourceId, personaUpn, confidence) => {

}

const mergeRelationshipDeclaration = async (controlObject) => {

}

const removePersonaDeclaration = async (sourceId, personaUpn) => {

}

const removeRelationshipDeclaration = async (controlObject) => {

}

//
// Query Calls
// 

const runRawQuery = async (query, optionalParams) => {
  /* Fix: enable automatic pagination

  optionalParams.page = optionalParams.page || 1;
  const pageSize = optionalParams?.pageSize || 1500;
  const orderBy = optionalParams?.orderBy || "upn";
  const orderByDirection = optionalParams?.orderByDirection || "ASC";

  const skip = neo4j.int((page - 1) * pageSize);
  const limit = neo4j.int(pageSize);
  const optionalParams = { skip, limit, ...optionalParams};
  */

}

const runRawQueryArray = async (queryArray) => {

}