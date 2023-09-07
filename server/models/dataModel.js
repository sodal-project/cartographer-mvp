const { database } = require('../utils/database.js');
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

const createTempFile = (csvData, filename) => {
  const tempFilePath = `./data/${filename}`;
  fs.writeFileSync(tempFilePath, csvData);
  return tempFilePath;
};

const deleteTempFile = (tempFilePath) => {
  try {
    fs.unlinkSync(tempFilePath);
  } catch (err) {
    console.error('Error deleting temp file:', err);
  }
};

const purgeDatabase = async () => {
  try {
    await database.dbQuery('MATCH (node) DETACH DELETE node');
    console.log('Database completely purged.')
  } catch (error) {
    console.error('Error purging database:', error);
    throw error;
  } 
}

const purgeIntegrations = async () => {
  try {
    await dbQuery(`
      MATCH (node)
      WHERE node.type <> 'participant'
      DETACH DELETE node
    `);
    console.log('Database integrations purged.')
  } catch (error) {
    console.error('Error purging database:', error);
    throw error;
  } 
}

const deleteCacheFiles = async () => {
  const folderPath = path.join(__dirname, `../data/cache/`)

  // This deletes all files located in the folderPath
  try {
    const files = await fs.promises.readdir(folderPath);
    for (const file of files) {
      const filePath = path.join(folderPath, file);
      await fs.promises.unlink(filePath);
      console.log(`Deleted file: ${filePath}`);
    }
    console.log('All cache files deleted successfully.');
  } catch (err) {
    console.error('Error deleting cache files:', err);
  }
}

module.exports = {
  setupDataFolder,
  setupDataSubFolders,
  createTempFile,
  deleteTempFile,
  purgeDatabase,
  purgeIntegrations,
  deleteCacheFiles
};
