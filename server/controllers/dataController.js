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

module.exports = {
  setupDataFolder
}
