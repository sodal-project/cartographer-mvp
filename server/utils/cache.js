const fs = require('fs').promises;
const path = require('path');

const localPath = './data/';
const cache = {};

cache.save = async (saveName, jsonObjectOutput) => {
  try {
    const savePathString = localPath + saveName + '.json';
    const savePath = path.join(process.cwd(), savePathString);
    console.error("Caching to " + savePath);
    await fs.writeFile(savePath, JSON.stringify(jsonObjectOutput));
  } catch (err) {
    console.error("Failed to cache " + saveName);
    console.error(err);
    return null;
  } 
}

cache.load = async (loadName) => {
  try {
    const loadPathString = localPath + loadName + '.json';
    const loadPath = path.join(process.cwd(), loadPathString);
    const content = await fs.readFile(loadPath);
    return JSON.parse(content);
  } catch (err) {
    return null;
  }
}

module.exports = {
  cache,
}