const { filterQueryBuilder } = require("../utils/filterQueryBuilder");
const { database } = require("../utils/database");
const {cache} = require('../utils/cache.js');

const testQueryControl = [
  {
    type: "filterField",
    name: "type", 
    value: "account", 
    not: false, 
    compareType: "=",
  },
  {
    type: "filterControl",
    direction: "CONTROL",
    rel: ["superadmin"],
    subset: [
      {
        type: "filterField",
        name: "platform", 
        value: "github", 
        not: false, 
        compareType: "=",
      },
      {
        type: "filterField",
        name: "type", 
        value: "organization", 
        not: false, 
        compareType: "=",
      },
    ],
  },
]

const testQueryMatch = [
  {
    type: "filterMatch",
    match: "IN",
    subset: [
      {
        type: "filterField",
        name: "platform", 
        value: "github", 
        not: false, 
        compareType: "=",
      },
    ],
  },
]

const getFilter = async (filterQuery) => {
  let queryString = filterQueryBuilder.getFilterQuery(testQueryControl);
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