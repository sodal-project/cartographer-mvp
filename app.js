const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const core = require('./v1staging/core');
core.init();

// Import controllers
const DataController = require('./controllers/dataController.js');
const DiscoveryController = require('./controllers/discoveryController.js');
const IntegrationController = require('./controllers/integrationController.js');
const PersonaController = require('./controllers/personaController.js');

// Set up multer for key file uploads
const storage = multer.diskStorage({
  destination: 'data/integrations/',
  filename: (req, file, callback) => {
    const fileExtension = path.extname(file.originalname);
    const multerGeneratedFilename = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const finalFilename = multerGeneratedFilename + fileExtension;
    callback(null, finalFilename);
  },
});
const keyUpload = multer({ storage: storage });

// Set up express
const app = express();
const port = process.env.SERVER_PORT;

// Enable CORS
app.use(cors());

// Parse URL-encoded bodies
app.use(express.json({limit: '100mb'})); // Parse JSON bodies
app.use(express.urlencoded({extended: true, limit: '100mb'}));

// Static files from React
app.use('/', express.static('client/build'));

// Discovery Sets
app.get(`/api/discoveryset/:setid`, DiscoveryController.getSet);
app.post(`/api/discoveryset`, DiscoveryController.addSet);
app.delete(`/api/discoveryset/:setid`, DiscoveryController.deleteSet);
app.get(`/api/discoverysets`, DiscoveryController.getSets);

// Personas
app.get(`/api/persona`, PersonaController.getPersona);
app.post(`/api/persona`, PersonaController.addPersona);
app.put(`/api/persona`, PersonaController.updatePersona);
app.delete(`/api/persona/:upn`, PersonaController.deletePersona);
app.post(`/api/personas`, PersonaController.getPersonas);
app.get(`/api/persona-agents`, PersonaController.getPersonaAgents);
app.get(`/api/persona-agents-control`, PersonaController.getAgentsControl);
app.get(`/api/persona-agents-obey`, PersonaController.getAgentsObey);
app.post(`/api/persona-link`, PersonaController.linkPersona);
app.post(`/api/persona-unlink`, PersonaController.unlinkPersona);
app.post(`/api/persona-relationships`, PersonaController.getRelationships);

// Participant
app.put(`/api/participant`, PersonaController.updateParticipant);

// Integrations
app.get(`/api/integrations`, IntegrationController.getIntegrations);
app.post(`/api/integration-add`, keyUpload.single('file'), IntegrationController.addIntegration);
app.delete(`/api/integration-delete/:id`, IntegrationController.deleteIntegration);
app.get(`/api/integrations-sync`, IntegrationController.syncIntegrations);

// Setup data folders
app.get(`/api/setup-folders`, DataController.setupDataFolder);

// Download csv as file
app.post(`/api/download-csv`, DataController.downloadCSV);

// Delete all nodes in the database
app.get(`/api/purge-db/:type`, DataController.purge);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
