const filterQueryBuilder = require("../utils/filterQueryBuilder");
const { database } = require("../utils/database");

const getFilter = async (filterQuery) => {
  if(!filterQuery) {
    filterQuery = filterQueryBuilder.testQuery.nested;
  }

  let queryString = filterQueryBuilder.getCypherFromQueryArray(filterQuery);
  let result = await database.dbQuery(queryString);
  const personas = result.records.map(record => record.get('nAgent'));
  return personas;
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