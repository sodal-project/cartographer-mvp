const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3001;

const {githubIntegration} = require('./integrations/github.js');
const {database} = require('./utils/database.js');

// Enable CORS
app.use(cors());

// Parse URL-encoded bodies
app.use(express.json()); // Parse JSON bodies

// Sync all personas
app.get('/integrations/sync', async (req, res) => {
  let personasData = await githubIntegration.generateAllPersonas();
  await database.mergePersonas(personasData);
  res.setHeader('Content-Type', 'application/json');
  res.json(personasData);
});

const getRespond = async (res, databaseCall) => {
  try {
    const result = await databaseCall;
    res.setHeader('Content-Type', 'application/json');
    res.json(result);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

app.get('/personas', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.pageSize) || 100;
  const databaseCall = database.getPersonas(page, pageSize);
  getRespond(res, databaseCall);
});

app.get('/persona-controls', async (req, res) => {
  const personaId = parseInt(req.query.id) || 1;
  const databaseCall = database.getPersonaControls(personaId);
  getRespond(res, databaseCall);
});

app.get('/persona-obeys', async (req, res) => {
  const personaId = parseInt(req.query.id) || 1;
  const databaseCall = database.getPersonaObeys(personaId);
  getRespond(res, databaseCall);
});

app.get('/persona-agents', async (req, res) => {
  const personaId = parseInt(req.query.id) || 1;
  const databaseCall = database.getPersonaAgents(personaId);
  getRespond(res, databaseCall);
});

app.get('/persona-agents-control', async (req, res) => {
  const personaId = parseInt(req.query.id) || 1;
  const databaseCall = database.getAgentsControl(personaId);
  getRespond(res, databaseCall);
});

app.get('/persona-agents-obey', async (req, res) => {
  const personaId = parseInt(req.query.id) || 1;
  const databaseCall = database.getAgentsObey(personaId);
  getRespond(res, databaseCall);
});

app.get('/persona-count', async (req, res) => {
  const databaseCall = database.getPersonaCount();
  getRespond(res, databaseCall);
});

// Get integrations from the JSON file
app.get('/integrations', (req, res) => {
  const filePath = path.join(__dirname, 'data/integrations.json');

  fs.readFile(filePath, 'utf8', (err, fileData) => {
    if (err) {
      console.error(err);
      res.status(500).json({ message: 'Error occurred while reading the integrations data file.' });
      return;
    }

    try {
      const integrations = JSON.parse(fileData);
      res.status(200).json(integrations);
    } catch (parseError) {
      console.error(parseError);
      res.status(500).json({ message: 'Error occurred while parsing the integrations data.' });
    }
  });
});

// Add an integration to the integrations file
app.post('/add-integration', (req, res) => {
  const data = req.body;
  const filePath = path.join(__dirname, 'data/integrations.json');

  // If we are missing data return an error for display
  let errors = [];
  if (!data.name) {
    errors.push('The name field cannot be blank');
  }
  if (!data.token) {
    errors.push('The token field cannot be blank');
  }
  if (!data.name || !data.token) {
    res.status(400).json({ errors: errors });
    return;
  }
  
  // Get all existing integrations
  fs.readFile(filePath, 'utf8', (err, fileData) => {
    if (err && err.code !== 'ENOENT') {
      console.error(err);
      res.status(500).json({ message: 'Error occurred while reading the data file.' });
      return;
    }

    let existingData = [];
    if (!err) {
      try {
        existingData = JSON.parse(fileData);
      } catch (parseError) {
        console.error(parseError);
        res.status(500).json({ message: 'Error occurred while parsing the existing data file.' });
        return;
      }
    }

    let updatedData = [];

    // If there isn't an id in the data add one
    if (!data.id) {
      const existingIds = existingData?.map((integration) => Number(integration.id));
      const highestId = existingIds && existingIds.length > 0 ? Math.max(...existingIds) : 0;
      const dataWithId = data.id ? data : { ...data, id: highestId + 1 };
      updatedData = [...existingData, dataWithId];
    }

    // If there is an id in the data, remove the item with that id from existing data and add the new data
    if (data.id) {
      const existingDataFiltered = existingData.filter((integration) => Number(integration.id) !== Number(data.id));
      updatedData = [...existingDataFiltered, data];
    }
    
    // Replace the data in the file with out updatedData
    fs.writeFile(filePath, JSON.stringify(updatedData), (writeErr) => {
      if (writeErr) {
        console.error(writeErr);
        res.status(500).json({ message: 'Error occurred while saving the data.' });
      } else {
        res.status(200).json({ message: 'Data received and saved successfully!' });
      }
    });
  });
});

// Delete an integration from the file
app.delete('/delete-integration/:id', (req, res) => {
  const itemId = req.params.id;
  const filePath = path.join(__dirname, 'data/integrations.json');

  // Get all existing integrations
  fs.readFile(filePath, 'utf8', (err, fileData) => {
    if (err && err.code !== 'ENOENT') {
      console.error(err);
      res.status(500).json({ message: 'Error occurred while reading the data file.' });
      return;
    }

    let existingData = [];
    if (!err) {
      try {
        existingData = JSON.parse(fileData);
      } catch (parseError) {
        console.error(parseError);
        res.status(500).json({ message: 'Error occurred while parsing the existing data file.' });
        return;
      }
    }

    // Remove the item with the id from existing data
    const updatedData = existingData.filter((integration) => Number(integration.id) !== Number(itemId));

    // Replace the data in the file with our updatedData
    fs.writeFile(filePath, JSON.stringify(updatedData), (writeErr) => {
      if (writeErr) {
        console.error(writeErr);
        res.status(500).json({ message: 'Error occurred while saving the data.' });
      } else {
        res.status(200).json({ message: 'Data received and saved successfully!' });
      }
    });
  });
});

// Delete all nodes in the database
app.get('/purge-db', async (req, res) => {
  try {
    await database.purgeDatabase();
    res.setHeader('Content-Type', 'application/json');
    res.json("database has been purged");
  } catch (error) {
    console.error('Error:', error);
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
