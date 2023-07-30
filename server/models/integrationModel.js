// integrationModel.js
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../data/integrations.json');

function readIntegrationsFile(callback) {
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
      callback({ message: 'Error occurred while reading the data file.' });
    } else {
      // If there isn't an id in the data add one
      if (!data.id) {
        const existingIds = existingData?.map((integration) => Number(integration.id));
        const highestId = existingIds && existingIds.length > 0 ? Math.max(...existingIds) : 0;
        const dataWithId = data.id ? data : { ...data, id: highestId + 1 };
        const updatedData = [...existingData, dataWithId];
        writeIntegrationsFile(updatedData, callback);
      } else {
        // If there is an id in the data, remove the item with that id from existing data and add the new data
        const updatedData = existingData.filter((integration) => Number(integration.id) !== Number(data.id));
        writeIntegrationsFile(updatedData, callback);
      }
    }
  });
}

function deleteIntegration(itemId, callback) {
  readIntegrationsFile((err, existingData) => {
    if (err) {
      callback({ message: 'Error occurred while reading the data file.' });
    } else {
      const updatedData = existingData.filter((integration) => Number(integration.id) !== Number(itemId));
      writeIntegrationsFile(updatedData, callback);
    }
  });
}

module.exports = {
  getIntegrations,
  addIntegration,
  deleteIntegration,
};
