const DataModel = require('../models/dataModel')
const {Persona} = require('../utils/persona')

const setupDataFolder = async (req, res) => {
  try {
    const response = await DataModel.setupDataFolder()
    const response2 = await DataModel.setupDataSubFolders(response)
    res.status(200).json({ resonse: response2 });
  } catch (error) {
    res.status(500).json({ error: `Internal Server error: ${error}` });
  }
}

const downloadCSV = (req, res) => {
  const { csv } = req.body;

  // Create a temporary file for the CSV data
  const tempFilePath = DataModel.createTempFile(csv, 'cartographer-export.csv');

  // Send the CSV file as a downloadable response
  res.download(tempFilePath, 'cartographer-export.csv', (err) => {
    if (err) {
      console.error('Error sending file:', err);
    }
    DataModel.deleteTempFile(tempFilePath);
  });
};

const purge = async (req, res) => {
  const { type } = req.params;
  Persona.localStore = {};

  if (type === "integrations") {
    try {
      await DataModel.purgeIntegrations();
      res.setHeader('Content-Type', 'application/json');
      return res.json("Integrations have been purged");
    } catch (error) {
      console.error('Error:', error);
    }
  } else if (type === "participants") {
    try {
      await DataModel.purgeDatabase();
      res.setHeader('Content-Type', 'application/json');
      return res.json("Integrations and participants have been purged");
    } catch (error) {
      console.error('Error:', error);
    }
  } else if (type === "files") {
    try {
      await DataModel.purgeIntegrations();
      await DataModel.deleteCacheFiles();
      res.setHeader('Content-Type', 'application/json');
      return res.json("Integrations and cache files have been purged");
    } catch (error) {
      console.error('Error:', error);
    }
  } else if (type === "all") {
    try {
      await DataModel.purgeDatabase();
      await DataModel.deleteCacheFiles();
      res.setHeader('Content-Type', 'application/json');
      return res.json("Integrations, participants and cache files have been purged");
    } catch (error) {
      console.error('Error:', error);
    }
  }
}

module.exports = {
  setupDataFolder,
  downloadCSV,
  purge
}
