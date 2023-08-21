const defaultSets = {
  0: {
    id: 0,
    name: "All Github Owner Accounts",
    query: [
      {
        type: "filterField",
        name: "type",
        value: "account",
        not: false,
        compareType: "=",
      },
      {
        type: "filterField",
        name: "platform",
        value: "github",
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
            name: "type",
            value: "organization",
            not: false,
            compareType: "=",
          },
        ]
      }
    ],
    referenceSets: [],
  }
}

module.exports = {
  defaultSets
}