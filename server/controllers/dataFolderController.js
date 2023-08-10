const DataFolderModel = require('../models/dataFolderModel')

const setupDataFolder = async (req, res) => {
  try {
    const response = await DataFolderModel.setupDataFolder()
    const response2 = await DataFolderModel.setupDataSubFolders(response)
    res.status(200).send(response2)
  } catch (error) {
    res.status(500).send(`Internal Server error: ${error}`)
  }
}

module.exports = {
  setupDataFolder
}
