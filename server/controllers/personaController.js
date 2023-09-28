const PersonaModel = require('../models/personaModel.js');

const respond = async (res, databaseCall) => {
  try {
    const result = await databaseCall;
    res.setHeader('Content-Type', 'application/json');
    res.json(result);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

const getPersona = async (req, res) => {
  const databaseCall = PersonaModel.getPersona(req.query.upn);
  respond(res, databaseCall);
};

const addPersona = async (req, res) => {
  let friendlyName = `${req.body.firstName} ${req.body.lastName}`
  if (req.body.handle) {
    friendlyName = `${friendlyName} (${req.body.handle})`
  }
  // TODO: Id should instead be a truly unique number
  const id = Math.floor(Math.random() * (99999999 - 1)) + 1
  const data = {
    id: `${id}`,
    upn: `upn:directory:participant:${id}`,
    type: "participant",
    platform: "directory",
    status: "active",
    friendlyName: friendlyName.trim(),
    handle: req.body.handle,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
  };

  // Errors
  let errors = [];
  if (!req.body.firstName && !req.body.firstName && !req.body.handle) {
    errors.push('At least one of the fields is required');
  }
  if (errors.length > 0) {
    res.status(400).json({ errors: errors });
    return;
  }

  const databaseCall = PersonaModel.addPersona(data);
  respond(res, databaseCall);
};

const getPersonas = async (req, res) => {
  const page = parseInt(req.body.page) || 1;
  const pageSize = parseInt(req.body.pageSize) || 100;
  const filterQuery = req.body.filterQuery || null;
  const filterQueryObject = filterQuery ? JSON.parse(filterQuery) : null;
  const databaseCall = PersonaModel.getPersonas(page, pageSize, filterQueryObject);
  respond(res, databaseCall);
};

const getPersonaControls = async (req, res) => {
  const personaUpn = decodeURIComponent(req.query.upn);
  const databaseCall = PersonaModel.getPersonaControls(personaUpn);
  respond(res, databaseCall);
};

const getPersonaObeys = async (req, res) => {
  const personaUpn = decodeURIComponent(req.query.upn);
  const databaseCall = PersonaModel.getPersonaObeys(personaUpn);
  respond(res, databaseCall);
};

const getPersonaAgents = async (req, res) => {
  const personaUpn = decodeURIComponent(req.query.upn);
  const databaseCall = PersonaModel.getPersonaAgents(personaUpn);
  respond(res, databaseCall);
};

const getAgentsControl = async (req, res) => {
  const personaUpn = decodeURIComponent(req.query.upn);
  const databaseCall = PersonaModel.getAgentsControl(personaUpn);
  respond(res, databaseCall);
};

const getAgentsObey = async (req, res) => {
  const personaUpn = decodeURIComponent(req.query.upn);
  const databaseCall = PersonaModel.getAgentsObey(personaUpn);
  respond(res, databaseCall);
};

const getPersonaCount = async (req, res) => {
  const databaseCall = PersonaModel.getPersonaCount();
  respond(res, databaseCall);
};

const linkPersona = async (req, res) => {
  const data = { 
    accessLevel: "superadmin",
    authMin: 1,
    personaUpn: req.body.personaUpn,
    participantUpn: req.body.participantUpn
  }

  // Errors
  let errors = [];
  if (!data.personaUpn) {
    errors.push('Persona UPN is missing');
  }
  if (!data.participantUpn) {
    errors.push('Participant UPN is missing');
  }
  if (errors.length > 0) {
    res.status(400).json({ errors: errors });
    return;
  }

  const databaseCall = PersonaModel.linkPersonas(data);
  respond(res, databaseCall);
};

const unlinkPersona = async (req, res) => {
  const data = { 
    personaUpn: req.body.personaUpn,
    participantUpn: req.body.participantUpn
  }

  // Errors
  let errors = [];
  if (!data.personaUpn) {
    errors.push('Persona UPN is missing');
  }
  if (!data.participantUpn) {
    errors.push('Participant UPN is missing');
  }
  if (errors.length > 0) {
    res.status(400).json({ errors: errors });
    return;
  }

  const databaseCall = PersonaModel.unlinkPersonas(data);
  respond(res, databaseCall);
};

const deletePersona = async (req, res) => {
  const upn = req.params.upn;
  const databaseCall = await PersonaModel.deletePersona(upn);
  respond(res, databaseCall);
};

module.exports = {
  getPersona,
  addPersona,
  getPersonas,
  getPersonaControls,
  getPersonaObeys,
  getPersonaAgents,
  getAgentsControl,
  getAgentsObey,
  getPersonaCount,
  linkPersona,
  unlinkPersona,
  deletePersona,
}