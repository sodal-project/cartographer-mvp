const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');

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
const port = 3001;

// Enable CORS
app.use(cors());

// Parse URL-encoded bodies
app.use(express.json()); // Parse JSON bodies

// Discovery Sets
app.get('/discoveryset/:setid', DiscoveryController.getSet);
app.post('/discoveryset', DiscoveryController.addSet);
app.delete('/discoveryset/:setid', DiscoveryController.deleteSet);
app.get('/discoverysets', DiscoveryController.getSets);

// Personas
app.get('/persona', PersonaController.getPersona);
app.post('/persona', PersonaController.addPersona);
app.delete('/persona/:upn', PersonaController.deletePersona);
app.get('/personas', PersonaController.getPersonas);
app.get('/persona-controls', PersonaController.getPersonaControls);
app.get('/persona-obeys', PersonaController.getPersonaObeys);
app.get('/persona-agents', PersonaController.getPersonaAgents);
app.get('/persona-agents-control', PersonaController.getAgentsControl);
app.get('/persona-agents-obey', PersonaController.getAgentsObey);
app.get('/persona-count', PersonaController.getPersonaCount);
app.post('/persona-link', PersonaController.linkPersona);

// Integrations
app.get('/integrations', IntegrationController.getIntegrations);
app.post('/integration-add', keyUpload.single('file'), IntegrationController.addIntegration);
app.delete('/integration-delete/:id', IntegrationController.deleteIntegration);
app.get('/integrations-sync', IntegrationController.syncIntegrations);

// Setup data folders
app.get('/setup-folders', DataController.setupDataFolder);

// Download csv as file
app.post('/download-csv', DataController.downloadCSV);

// Delete all nodes in the database
app.get('/purge-db/:type', DataController.purge);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
