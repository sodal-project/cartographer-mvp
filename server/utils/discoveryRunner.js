const discoverySet = require('./discoverySet');
const database = require('./database');

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
      direction: "CONTROL",
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
      match: "IN",
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
      direction: "CONTROL",
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
          direction: "CONTROL",
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

const runQueryArray = (queryArray) => {
  // consolidate filter fields

  // process control fields

  // process match fields
}

const getNodesFromUpns = (upnArray) => {
  // return nodes;
}

const getUpnArrayFromResponse = (response) => {
  // return response.upn;
}

const getFilterQueryString = (upnArray) => {
  // return queryHeaderString;
  // consider precedence of filter responses for aliases
  // 
  // status: root persona takes precendence
  // type: multiple (use allAliases, group/email)
  // platform: multiple (use allAliases, google/email)
  // id: multiple (use allAliases)
  // friendlyName: multiple (use allAliases)
}

const getMatchInQueryString = (rootUpns, compareUpns) => {
  // return matchInQueryString
}

const getMatchNotInQueryString = (rootUpns, compareUpns) => {
  // return matchNotInQueryString
}

const getNotObeyQueryString = (rootUpns, compareUpns) => {
  // return notObeyQueryString
}

const getArrayQueryString = (upnArray) => {
  // return queryHeaderString;
}