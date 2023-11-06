const testQuery = {
  control: [
    {
      type: "filterField",
      name: "type", 
      value: "account", 
      not: false, 
      operator: "=",
    },
    {
      type: "filterControl",
      direction: "control",
      relationship: ["superadmin"],
      subset: [
        {
          type: "filterField",
          name: "platform", 
          value: "github", 
          not: false, 
          operator: "=",
        },
        {
          type: "filterField",
          name: "type", 
          value: "organization", 
          not: false, 
          operator: "=",
        },
      ],
    },
  ],
  match: [
    {
      type: "filterMatch",
      match: "in",
      subset: [
        {
          type: "filterField",
          name: "platform", 
          value: "github", 
          not: false, 
          operator: "=",
        },
        {
          type: "filterField",
          name: "type",
          value: "organization",
          not: false,
          operator: "=",
        }
      ],
    },
  ],
  nested: [
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
      relationship: ["superadmin", "admin", "user"],
      subset: [
        {
          type: "filterField",
          name: "platform", 
          value: "github", 
          not: false, 
          operator: "=",
        },
        {
          type: "filterField",
          name: "type", 
          value: "account", 
          not: false, 
          operator: "=",
        },
        {
          type: "filterControl",
          direction: "control",
          relationship: ["superadmin"],
          subset: [
            {
              type: "filterField",
              name: "platform",
              value: "github",
              not: false,
              operator: "=",
            },
            {
              type: "filterField",
              name: "type",
              value: "organization",
              not: false,
              operator: "=",
            },
          ],
        },
      ],
    },
  ]
}

module.exports = {
  testQuery,
}