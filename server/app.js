const express = require('express');
const cors = require('cors');
const app = express();
const port = 3001;

const personas = [
  { name: 'tbenbow', platform: 'github' },
  { name: 'andyschwab', platform: 'github' },
  { name: 'jbenet', platform: 'github' },
]

// Enable CORS
app.use(cors());

app.get('/personas', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.json(personas);
});

app.get('/create', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.json(personas);
});

app.get('/read', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.json(personas);
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
