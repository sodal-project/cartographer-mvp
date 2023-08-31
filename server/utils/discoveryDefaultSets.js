const defaultSets = {
  0: {
    id: 0,
    name: "All Github Owner Accounts",
    subset: [
      {
        type: "filterField",
        name: "type",
        value: "account",
        not: false,
        operator: "=",
      },
      {
        type: "filterField",
        name: "platform",
        value: "github",
        not: false,
        operator: "=",
      },
      {
        type: "filterControl",
        direction: "control",
        relationships: ["superadmin"],
        subset: [
          {
            type: "filterField",
            name: "type",
            value: "organization",
            not: false,
            operator: "=",
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