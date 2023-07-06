const express = require('express');
const cors = require('cors');
const fs = require('fs');
const neo4j = require('neo4j-driver');

const {githubIntegration} = require('./integrations/github.js');

const app = express();
const port = 3001;

// Set up the Neo4j driver
const driver = neo4j.driver('bolt://cartographer-neo4j-db-1:7687', neo4j.auth.basic('neo4j', 'password'), { encrypted: false });

const personas = [
  { name: 'tbenbow', platform: 'github' },
  { name: 'andyschwab', platform: 'github' },
  { name: 'jbenet', platform: 'github' },
]

// Enable CORS
app.use(cors());

app.get('/load', async (req, res) => {

  let personasData = await githubIntegration.generateAllPersonas();

  res.setHeader('Content-Type', 'application/json');
  res.json(personasData);
});

app.get('/personas', (req, res) => {
  const filePath = 'data/personas.json';

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      res.status(404).send('Personas file not found. Has it been created?');
      return;
    }

    const personasData = JSON.parse(data);
    res.setHeader('Content-Type', 'application/json');
    res.json(personasData);
  });
});

app.get('/add-personas', (req, res) => {
  // Write a JSON file with the personas array
  const jsonContent = JSON.stringify(personas);
  fs.writeFile('data/personas.json', jsonContent, 'utf8', (err) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error occurred while creating the file.');
    } else {
      res.send('JSON file created successfully.');
    }
  });
});

app.get('/delete-personas', (req, res) => {
  const filePath = 'data/personas.json';

  fs.unlink(filePath, (err) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error occurred while deleting the file.');
      return;
    }

    res.send('File deleted successfully.');
  });
});

// Return all nodes in the database
app.get('/db', async (req, res) => {
  const session = driver.session();
  try {
    // Run a Neo4j query to retrieve all nodes
    const result = await session.run('MATCH (n:Node) RETURN n');
    const nodes = result.records.map(record => record.get('n').properties);

    res.json(nodes);
  } catch (error) {
    console.error('Error retrieving nodes:', error);
    res.status(500).send('Error retrieving nodes');
  } finally {
    session.close();
  }
});


// Add a node to the database
app.get('/add-db', async (req, res) => {
  const session = driver.session();
  try {
    // Run a Neo4j query to create a node
    await session.run('CREATE (n:Node {name: $name})', { name: 'Example Node' });

    res.send('Node created successfully!');
  } catch (error) {
    console.error('Error creating node:', error);
    res.status(500).send('Error creating node');
  } finally {
    session.close();
  }
});

// Delete all nodes in the database
app.get('/delete-db', async (req, res) => {
  const session = driver.session();
  try {
    // Delete all nodes in the database
    await session.run('MATCH (n:Node) DETACH DELETE n');

    res.send('Nodes deleted successfully!');
  } catch (error) {
    console.error('Error deleting nodes:', error);
    res.status(500).send('Error deleting nodes');
  } finally {
    session.close();
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
