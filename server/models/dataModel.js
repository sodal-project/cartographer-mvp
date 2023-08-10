const fs = require('fs');
const path = require('path');

function setupDataFolder() {
  return new Promise(async (resolve, reject) => {
    const folderPath = path.join(__dirname, `../data`)

    // Data folder already exists
    if (fs.existsSync(folderPath)) {
      resolve('data folder already exists')

    // No data folder, create it
    } else {
      try {
        await fs.promises.mkdir(folderPath)
        resolve('created data folder')
      } catch (error) {
        reject(`Error creating data folder: ${error}`)
      }
    }
  })
}

function setupDataSubFolders(response) {
  return new Promise(async (resolve, reject) => {

    // Determine folders to create
    const requiredFolders = ['cache', 'sets', 'integrations']
    const foldersToCreate = requiredFolders.filter(folder => {
      let folderPath = path.join(__dirname, `../data/${folder}`)
      return !fs.existsSync(folderPath)
    })

    // Check if we need to create folders
    if (foldersToCreate.length === 0) {
      resolve (`${response}, sub folders already exist`)
    }
    
    // Create Folder Promises
    const foldersToCreatePromises = foldersToCreate.map(folder => {
      let folderPath = path.join(__dirname, `../data/${folder}`)
      return fs.promises.mkdir(folderPath)
    })

    // Wait for all folders to be created
    try {
      await Promise.all(foldersToCreatePromises)
      resolve (`${response}, sub folders created`)
    } catch (error) {
      reject('Error creating sub folders in data')
    }
  })
}

module.exports = {
  setupDataFolder,
  setupDataSubFolders
};
