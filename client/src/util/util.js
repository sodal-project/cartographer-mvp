export function findHighestId(obj) {
  let highestId = 0;

  function traverse(obj) {
    if (obj.id && obj.id > highestId) {
      highestId = obj.id;
    }
    if (obj.subset && Array.isArray(obj.subset)) {
      for (const subObj of obj.subset) {
        traverse(subObj);
      }
    }
  }
  for (const item of obj) {
    traverse(item);
  }
  return highestId;
}

/*
  Add Unique IDs
  Add unique ids to each object in the array including nested ones inside subset
*/
export function addUniqueIds(obj) {
  let highestId = 0;

  function traverse(obj) {

    if (!obj.id) {
      obj.id = highestId + 1;
      highestId++;
    }

    if (obj.subset && Array.isArray(obj.subset)) {
      for (const subObj of obj.subset) {
        traverse(subObj);
      }
    }

  }
  for (const item of obj) {
    traverse(item);
  }
  return obj;
}
