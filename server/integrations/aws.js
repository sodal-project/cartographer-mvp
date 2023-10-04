const AWS = require('aws-sdk');
const {Persona} = require('../utils/persona');
const {cache} = require('../utils/cache');
const { request } = require('express');

async function generateAllPersonas(integration){
  AWS.config.update({
    accessKeyId: integration.accessKeyId,
    secretAccessKey: integration.secretAccessKey,
    region: 'us-east-1' // Change to your desired AWS region
  });

  const options = {
    integrationName: integration.name.replace(/ /g, '-').toLowerCase(),
    api: new AWS.Organizations(), // Provides access to the Organizations API
    iam: new AWS.IAM(), // Provides access to the IAM API
  }

  try {
    const root = await getRoot(options);
    options.rootId = root.Id;
    
    const organizationPersona = await generateOrganizationPersona(options);
    options.organizationId = organizationPersona.id;
    options.organizationUpn = organizationPersona.upn;
    
    const organizationalUnitsPersonas = await generateOrganizationalUnitPersonas(options);
    options.organizationalUnits = organizationalUnitsPersonas;
    
    const accountPersonas = await generateAccountPersonas(options);

    const iamPersonas = await generateIAMPersonas(options);

    const allPersonas = [organizationPersona, ...organizationalUnitsPersonas, ...accountPersonas, ...iamPersonas];
    return allPersonas;
  } catch(e) {
    console.log(e);
  }
}

// Root (We need this to get the root id)
const getRoot = async (options) => {
  const cacheName = `aws-${options.integrationName}-root`;
  const data = await loadCached(loadRoot, options, cacheName);
  return data.Roots[0];
}
const loadRoot = async (options) => {
  return new Promise((resolve, reject) => {
    options.api.listRoots({}, (err, data) => {
      if (err) {
        reject(new Error("Error loading root from AWS API"));
      } else {
        resolve(data);
      }
    });
  });
}

// Organization (only processing the first one, maybe multiples are possible though)
const generateOrganizationPersona = async (options) => {
  const cacheName = `aws-${options.integrationName}-organization`;
  const data = await loadCached(loadOrganization, options, cacheName);
  const persona = await createPersonaFromOrganization(data, options.integrationName);
  return persona
}

const loadOrganization = async (options) => {
  return new Promise((resolve, reject) => {
    options.api.describeOrganization({}, (err, data) => {
      if (err) {
        reject(new Error("Error loading organization info from AWS API"));
      } else {
        resolve(data);
      }
    });
  });
}

const createPersonaFromOrganization = async (data, integrationName) => {
  const organization = data.Organization;
  const standardProps = {
    id: organization.Id,
    platform: "aws",
    type: "organization",
    status: "active",
    friendlyName: `${integrationName} (${organization.Id})`,
  }
  const customProps = {
    arn: organization.Arn,
  }
  
  const persona = await Persona.create(standardProps, customProps);
  const emailPersona = Persona.addPersonaEmailAccount(organization.MasterAccountEmail);
  Persona.addController(persona.upn, emailPersona.upn, 'superadmin');
  return persona;
}

// Organizational Units
const generateOrganizationalUnitPersonas = async (options) => {
  const cacheName = `aws-${options.integrationName}-orgunits`;
  const data = await loadCached(loadOrganizationalUnits, options, cacheName);
  const personas = [];

  for(const unit of data.OrganizationalUnits) {
    const persona = await createPersonaFromOrganizationalUnit(unit, options);
    if (persona) {
      personas.push(persona)
    };
  }
  return personas;
}

const loadOrganizationalUnits = async (options) => {
  const data = {
    OrganizationalUnits: []
  }
  let nextToken = null;

  do {
    let response = await new Promise((resolve, reject) => {
      options.api.listOrganizationalUnitsForParent({
        NextToken: nextToken,
        ParentId: options.rootId
      }, (err, data) => {
        if (err) {
          reject(new Error("Error loading accounts from AWS API"));
        } else {
          resolve(data); // Resolving with data from the API call
        }
      });
    });
    data.OrganizationalUnits = data.OrganizationalUnits.concat(response.OrganizationalUnits);
    nextToken = response.NextToken;
  } while (nextToken);

  return data;
}

const createPersonaFromOrganizationalUnit = async (data, options) => {
  const standardProps = {
    platform: "aws",
    type: "orgunit",
    id: `${data.Id}`,
    status: "active",
    friendlyName: `${data.Name} (${data.Id})`,
  }
  const customProps = {
    arn: data.Arn,
    name: data.Name,
  }

  const persona = await Persona.create(standardProps, customProps);
  Persona.addController(persona.upn, options.organizationUpn, 'system');
  return persona;
}

// Org Unit Accounts
const generateAccountPersonas = async (options) => {
  const personas = {};

  // Load all accounts
  const cacheName = `aws-${options.integrationName}-accounts`;
  const data = await loadCached(loadAllAccounts, options, cacheName);

  for(const account of data.Accounts) {
    const persona = await createPersonaFromAccount(account, options);
    if (persona) {
      personas[persona.upn] = persona;
    }
  }

  // TODO: Refactor to avoid duplicate persona creation
  for (const orgUnit of options.organizationalUnits) {
    options.currentOrgUnitId = orgUnit.id;
    options.currentOrgUnitUpn = orgUnit.upn;

    const cacheName = `aws-${options.integrationName}-orgunit-${orgUnit.id}-accounts`;
    const data = await loadCached(loadAccountsForOrgUnit, options, cacheName);

    for (const account of data.Accounts) {
      const persona = await createPersonaFromAccount(account, options);
      if (persona) {
        personas[persona.upn] = persona;
      }
    }
  }
  return Object.values(personas);
};

const loadAllAccounts = async (options) => {
  const data = {
    Accounts: []
  }
  let nextToken = null;

  do {
    let response = await new Promise((resolve, reject) => {
      options.api.listAccounts({
        NextToken: nextToken,
        MaxResults: 20
      }, (err, data) => {
        if (err) {
          reject(new Error("Error loading accounts from AWS API"));
        } else {
          resolve(data); // Resolving with data from the API call
        }
      });
    });
    data.Accounts = data.Accounts.concat(response.Accounts);
    nextToken = response.NextToken;
  } while (nextToken);

  return data;
};

const loadAccountsForOrgUnit = async (options) => {
  return new Promise((resolve, reject) => {
    options.api.listAccountsForParent({ ParentId: options.currentOrgUnitId }, (err, data) => {
      if (err) {
        reject(new Error("Error loading accounts from AWS API"));
      } else {
        resolve(data); // Resolving with data from the API call
      }
    });
  });
};

const createPersonaFromAccount = async (data, options) => {
  const standardProps = {
    platform: "aws",
    type: "account",
    id: data.Id,
    status: data.Status === "ACTIVE" ? "active" : "suspended",
    friendlyName: `${data.Name} (${data.Id})`,
  };
  const customProps = {
    arn: data.Arn,
    awsAccountType: "account",
    name: data.Name,
  };

  const persona = await Persona.create(standardProps, customProps);
  const emailPersona = Persona.addPersonaEmailAccount(data.Email);
  Persona.addController(persona.upn, emailPersona.upn, 'superadmin');
  if(options.organizationUpn) {
    Persona.addController(options.organizationUpn, persona.upn, 'user');
    Persona.addController(persona.upn, options.organizationUpn, 'system');
  }
  if(options.currentOrgUnitUpn) {
    Persona.addController(options.currentOrgUnitUpn, persona.upn, 'user');
  }
  
  return persona;
};

const generateIAMPersonas = async (options) => {
  const personas = {};

  // Load all users
  const cacheName = `aws-${options.integrationName}-users`;
  const data = await loadCached(loadIAMUsers, options, cacheName);

  for(const user of data.Users) {
    const persona = await createPersonaFromUser(user, options);
    if (persona) {
      personas[persona.upn] = persona;
    }
  }
  return Object.values(personas);
}

const loadIAMUsers = async (options) => {
  const data = {
    Users: []
  }
  let marker = null;

  do {
    let response = await new Promise((resolve, reject) => {
      options.iam.listUsers({
        Marker: marker,
        MaxItems: 100
      }, (err, data) => {
        if (err) {
          reject(new Error("Error loading users from AWS API"));
        } else {
          resolve(data); // Resolving with data from the API call
        }
      });
    });
    data.Users = data.Users.concat(response.Users);
    marker = response.Marker;
  } while (marker);

  return data;
}


const createPersonaFromUser = async (data, options) => {
  const standardProps = {
    platform: "aws",
    type: "account",
    id: data.UserId,
    status: "active",
    friendlyName: `${data.UserName} (${data.UserId})`,
  };
  const customProps = {
    arn: data.Arn,
    name: data.UserName,
    awsAccountType: "iam",
    createDate: data.CreateDate,
  };

  const persona = await Persona.create(standardProps, customProps);
  if(options.organizationUpn) {
    Persona.addController(options.organizationUpn, persona.upn, 'user');
    Persona.addController(persona.upn, options.organizationUpn, 'system');
  }
  return persona;
};

// Load Cached
const loadCached = async (apiCall, options, cacheName) => {

  // Try loading from cache first
  const cacheElements = await cache.load(cacheName);
  if (cacheElements) {
    return cacheElements; // Return cached data if available
  }

  // Make the request to the API and save it to cache
  const elements = await apiCall(options);
  await cache.save(cacheName, elements);
  return elements; // Return data from the API call
};

module.exports = {
  awsIntegration: {
    generateAllPersonas,
  }
}
