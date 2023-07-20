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

const getPersonas = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.pageSize) || 100;
  const databaseCall = PersonaModel.getPersonas(page, pageSize);
  respond(res, databaseCall);
};

const getPersonaControls = async (req, res) => {
  const personaId = req.query.id;
  const databaseCall = PersonaModel.getPersonaControls(personaId);
  respond(res, databaseCall);
};

const getPersonaObeys = async (req, res) => {
  const personaId = req.query.id;
  const databaseCall = PersonaModel.getPersonaObeys(personaId);
  respond(res, databaseCall);
};

const getPersonaAgents = async (req, res) => {
  const personaId = req.query.id;
  const databaseCall = PersonaModel.getPersonaAgents(personaId);
  respond(res, databaseCall);
};

const getAgentsControl = async (req, res) => {
  const personaId = req.query.id;
  const databaseCall = PersonaModel.getAgentsControl(personaId);
  respond(res, databaseCall);
};

const getAgentsObey = async (req, res) => {
  const personaId = req.query.id;
  const databaseCall = PersonaModel.getAgentsObey(personaId);
  respond(res, databaseCall);
};

const getPersonaCount = async (req, res) => {
  const databaseCall = PersonaModel.getPersonaCount();
  respond(res, databaseCall);
};

module.exports = {
  getPersonas,
  getPersonaControls,
  getPersonaObeys,
  getPersonaAgents,
  getAgentsControl,
  getAgentsObey,
  getPersonaCount,
}