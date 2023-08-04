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
