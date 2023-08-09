const DataFolderModel = require('../models/dataFolderModel');

const setupDataFolder = async (req, res) => {
  try {
    const foldersCreated = await DataFolderModel.setupDataFolder();
    if (foldersCreated) {
      res.status(200).send('Folders setup successfully.');
    }
  } catch (error) {
    console.error('Controller Error:', error);
    res.status(500).send('Internal Server Error');
  }
};

module.exports = {
  setupDataFolder
}