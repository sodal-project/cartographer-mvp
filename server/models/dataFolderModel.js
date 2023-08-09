const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../data');

function folderCreate(folderName) {
  const folderPath = path.join(dataPath, folderName);
  if (fs.existsSync(folderPath)) {
    console.log(`Directory ${folderPath} exists`)
  } else {
    console.log(`Directory ${folderPath} doesn't exist`)
    fs.mkdir(folderPath, (err) => {
      if (err) {
        return console.error(err);
      }
      console.log(`Directory ${folderName} created successfully!`);
    });
  }
}

function setupDataFolder() {
  const requiredFolders = ['cache', 'sets', 'keys', 'logs', 'csv'];
  requiredFolders.forEach(folder => {
    folderCreate(folder);
  })
  return true;
}

module.exports = {
  setupDataFolder
};
