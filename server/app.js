const express = require('express');
const cors = require('cors');

const app = express();
const port = 3001;

const {githubIntegration} = require('./integrations/github.js');
const {database} = require('./utils/database.js');

// Enable CORS
app.use(cors());

// Sync all personas
app.get('/integrations/sync', async (req, res) => {
  let personasData = await githubIntegration.generateAllPersonas();
  await database.mergePersonas(personasData);
  res.setHeader('Content-Type', 'application/json');
  res.json(personasData);
});

// Get personas from the database
app.get('/personas', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.pageSize) || 100;

  try {
    const nodes = await database.getPersonas(page, pageSize);
    res.setHeader('Content-Type', 'application/json');
    res.json(nodes);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Get personas from the database
app.get('/persona-count', async (req, res) => {
  try {
    const count = await database.getPersonaCount();
    res.setHeader('Content-Type', 'application/json');
    res.json(count);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
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
