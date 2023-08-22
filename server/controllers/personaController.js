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
  if (!friendlyName) {
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
  const page = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.pageSize) || 100;
  const filterQuery = decodeURIComponent(req.query.filterQuery) || null;
  const filterQueryObject = req.query.filterQuery ? JSON.parse(filterQuery) : null;
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
}