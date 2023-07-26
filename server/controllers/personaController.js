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

const getPersonas = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.pageSize) || 100;
  const databaseCall = PersonaModel.getPersonas(page, pageSize);
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
  getPersonas,
  getPersonaControls,
  getPersonaObeys,
  getPersonaAgents,
  getAgentsControl,
  getAgentsObey,
  getPersonaCount,
}