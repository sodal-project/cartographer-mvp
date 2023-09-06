const DataModel = require('../models/dataModel')

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


module.exports = {
  setupDataFolder,
  downloadCSV
}
