const fs = require('fs').promises;
const path = require('path');

const localPath = './data/';
const defaultDir = 'cache';
const cache = {};

cache.save = async (saveName, jsonObjectOutput, rootDir = defaultDir) => {
  try {
    const savePathString = localPath + rootDir + '/' + saveName + '.json';
    const savePath = path.join(process.cwd(), savePathString);
    await fs.writeFile(savePath, JSON.stringify(jsonObjectOutput, false, 4));
  } catch (err) {
    console.error("Failed to cache " + saveName);
    console.error(err);
    return null;
  } 
}

cache.load = async (loadName, rootDir = defaultDir) => {
  try {
    const loadPathString = localPath + rootDir + '/' + loadName + '.json';
    const loadPath = path.join(process.cwd(), loadPathString);
    const content = await fs.readFile(loadPath);
    return JSON.parse(content);
  } catch (err) {
    console.error("Failed to load " + loadName);
    return null;
  }
}

module.exports = {
  cache,
}