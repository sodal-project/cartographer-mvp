/*
  Find Highest ID
*/
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
  Remove All IDs
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

/*
  Sort Objects
  Sort an array of objects by the passed property
*/
export function sortObjects(data, property, direction) {
  const sortedData = [...data].sort((a, b) => {
    const nameA = a[property]?.toUpperCase() || "";
    const nameB = b[property]?.toUpperCase() || "";

    if (direction === "DESC") {
      if (nameA > nameB) return -1;
      if (nameA < nameB) return 1;
      return 0;
    } else {
      if (nameA < nameB) return -1;
      if (nameA > nameB) return 1;
      return 0;
    }
  });
  return sortedData;
}

/*
  Convert Object Array To CSV
  The CSV headers will be the keys of the first object in the array
*/
export function convertObjectArrayToCSV(data) {
  const defaultHeader = ["upn", "lastVerified", "id", "type", "friendlyName", "platform", "status"];
  const header = [...new Set([...defaultHeader, ...Object.keys(data[0])])];

  const csv = [
    header.map(field => `"${field}"`).join(','),
    ...data.map(obj => header.map(key => {
      if(obj[key]) {
        return `"${obj[key].toString().replace(/"/g, '""')}"`
      } else {
        return ""
      }
    }).join(','))
  ];
  return csv.join('\n');
}

/*
  Download CSV
  An async function that will handle downloading a CSV file from the server
*/
export async function downloadCSV(csv, filename = 'cartographer-export.csv') {
  // Send the CSV string to the server
  const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/download-csv`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ csv }),
  });

  // Check if the response is successful and initiate the download
  if (response.ok) {
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
  } else {
    console.error('Failed to download CSV');
  }
};
