const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../data/sets/sets.json');

function checkForSetsFile() {
  if (!fs.existsSync(filePath)) {
    fs.writeFile(filePath, '[]', (err) => {
      if (err) {
        console.error(err);
      }
    })
  }
}

function readSetsFile(callback) {
  checkForSetsFile();
  fs.readFile(filePath, 'utf8', (err, fileData) => {
    if (err) {
      callback(err);
    } else {
      try {
        const sets = JSON.parse(fileData);
        callback(null, sets);
      } catch (parseError) {
        callback(parseError);
      }
    }
  });
}

function writeSetsFile(updatedData, savedSet, callback) {
  fs.writeFile(filePath, JSON.stringify(updatedData), (writeErr) => {
    if (writeErr) {
      callback({ message: 'Error occurred while saving the data.' });
    } else {
      callback(null, savedSet);
    }
  });
}

function getSet(itemId, callback) {
  readSetsFile((err, existingData) => {
    if (err) {
      callback({ message: 'Error occurred while reading the data file for getSet.' });
    } else {

      // Check if the set exists
      const setToGet = existingData.find((set) => Number(set.setid) === Number(itemId));
      if (!setToGet) {
        callback({ message: 'set not found.' });
        return;
      }

      // Return the set
      callback(null, setToGet);
    }
  });
}

function getSets(callback) {
  readSetsFile(callback);
}

function addSet(data, callback) {
  readSetsFile((err, existingData) => {
    if (err) {
      callback({ message: 'Error occurred while reading the data file for add set.' });
    } else {
      // If there isn't a setid in the data add one
      if (!data.setid) {
        const existingIds = existingData?.map((set) => Number(set.setid));
        const highestId = existingIds && existingIds.length > 0 ? Math.max(...existingIds) : 0;
        const dataWithId = data.setid ? data : { ...data, setid: highestId + 1 };
        const updatedData = [...existingData, dataWithId];
        writeSetsFile(updatedData, dataWithId, callback);
      } else {
        // If there is a setid in the data, remove the item with that id from existing data and add the submitted data
        const filteredData = existingData.filter((set) => Number(set.setid) !== Number(data.setid));
        writeSetsFile([...filteredData, data], data, callback);
      }
    }
  });
}

function deleteSet(itemId, callback) {
  readSetsFile((err, existingData) => {
    if (err) {
      callback({ message: 'Error occurred while reading the data file for delete.' });
    } else {

      // Check if the set exists
      const setToDelete = existingData.find((set) => Number(set.setid) === Number(itemId));
      if (!setToDelete) {
        callback({ message: 'set not found.' });
        return;
      }

      // Remove the set from the data file
      const updatedData = existingData.filter((set) => Number(set.setid) !== Number(itemId));
      writeSetsFile(updatedData, callback);
    }
  });
}

module.exports = {
  getSet,
  getSets,
  addSet,
  deleteSet
};
