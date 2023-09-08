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

/*
  Remove IDs
  Remove ids from all objects including nested ones inside subset
*/
export function removeAllIds(obj) {
  function traverse(obj) {

    if (obj.id) {
      delete obj.id
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

export function convertObjectArrayToCSV(data) {
  const header = Object.keys(data[0]);
  const csv = [
    header.join(','),
    ...data.map(obj => header.map(key => obj[key]).join(','))
  ];
  return csv.join('\n');
}

/*
  Sort Objects
  Sort an array of objects by the passed property
*/
export function sortObjects (data, property) {
  data.sort((a, b) => {
    const nameA = a[property].toUpperCase();
    const nameB = b[property].toUpperCase();
  
    if (nameA < nameB) {
      return -1;
    }
    if (nameA > nameB) {
      return 1;
    }
    return 0;
  });
  return data
}
