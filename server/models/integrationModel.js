const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../data/integrations.json');

function checkForIntegrationsFile() {
  if (!fs.existsSync(filePath)) {
    fs.writeFile(filePath, '[]', (err) => {
      if (err) {
        console.error(err);
      }
    })
  }
}

function readIntegrationsFile(callback) {
  checkForIntegrationsFile();
  fs.readFile(filePath, 'utf8', (err, fileData) => {
    if (err) {
      callback(err);
    } else {
      try {
        const integrations = JSON.parse(fileData);
        callback(null, integrations);
      } catch (parseError) {
        callback(parseError);
      }
    }
  });
}

function writeIntegrationsFile(updatedData, callback) {
  fs.writeFile(filePath, JSON.stringify(updatedData), (writeErr) => {
    if (writeErr) {
      callback({ message: 'Error occurred while saving the data.' });
    } else {
      callback(null, { message: 'Data received and saved successfully!' });
    }
  });
}

function getIntegrations(callback) {
  readIntegrationsFile(callback);
}

function addIntegration(data, callback) {
  readIntegrationsFile((err, existingData) => {
    if (err) {
      callback({ message: 'Error occurred while reading the data file for add.' });
    } else {
      // If there isn't an id in the data add one
      if (!data.id) {
        const existingIds = existingData?.map((integration) => Number(integration.id));
        const highestId = existingIds && existingIds.length > 0 ? Math.max(...existingIds) : 0;
        const dataWithId = data.id ? data : { ...data, id: highestId + 1 };
        const updatedData = [...existingData, dataWithId];
        writeIntegrationsFile(updatedData, callback);
      } else {
        // If there is an id in the data, remove the item with that id from existing data and add the submitted data
        const filteredData = existingData.filter((integration) => Number(integration.id) !== Number(data.id));
        writeIntegrationsFile([...filteredData, data], callback);
      }
    }
  });
}

function deleteIntegration(itemId, callback) {
  readIntegrationsFile((err, existingData) => {
    if (err) {
      callback({ message: 'Error occurred while reading the data file for delete.' });
    } else {
      // Check if the integration exists
      const integrationToDelete = existingData.find((integration) => Number(integration.id) === Number(itemId));
      if (!integrationToDelete) {
        callback({ message: 'Integration not found.' });
        return;
      }

      // Check if the integration has a keyfile and delete it
      if (integrationToDelete.keyFile) {
        const keyfilePath = path.join(__dirname, '../data/keys/', integrationToDelete.keyFile);
        fs.unlink(keyfilePath, (unlinkErr) => {
          if (unlinkErr) {
            console.error('Error deleting the keyfile:', unlinkErr);
          }
        });
      }

      // Remove the integration from the data file
      const updatedData = existingData.filter((integration) => Number(integration.id) !== Number(itemId));
      writeIntegrationsFile(updatedData, callback);
    }
  });
}

function importCsv(data, callback) {
  const csvFilePath = path.join(__dirname, `../data/csv/${data.file}`);
  fs.readFile(csvFilePath, 'utf8', (err, fileData) => {
    if (err) {
      callback(err);
    } else {
      try {
        console.log(fileData);
        // Do stuff with file data here
      } catch (parseError) {
        callback(parseError);
      }
    }
  });
}

module.exports = {
  getIntegrations,
  addIntegration,
  deleteIntegration,
  importCsv
};
