const filterQueryBuilder = require("../utils/filterQueryBuilder");
const { database } = require("../utils/database");

const getFilter = async (filterQuery) => {
  if(!filterQuery) {
    filterQuery = filterQueryBuilder.testQuery.nested;
  }

  let queryString = filterQueryBuilder.getFilterQuery(filterQuery);
  console.log(queryString);

  let result = await database.dbQuery(queryString);
  let friendlyNames = getFriendlyNamesFromResult(result);
  for(let i in friendlyNames){
    let name = friendlyNames[i];
    console.log(name);
  }
}

const getFriendlyNamesFromResult = (result) => {
  let records = result.records;
  let friendlyNames = [];
  for(let i in records){
    let record = records[i]._fields[0].properties.friendlyName;
    friendlyNames.push(record);
  }
  return friendlyNames;
}

module.exports = {
  getFilter,
};