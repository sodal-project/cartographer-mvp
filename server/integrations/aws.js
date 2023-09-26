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
    api: new AWS.Organizations() // Provides access to the Organizations API
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

    return Persona.localStore;
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
  const persona = await createPersonaFromOrganization(data);
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
const createPersonaFromOrganization = async (data) => {
  const organization = data.Organization;
  const standardProps = {
    id: organization.Id,
    platform: "aws",
    type: "organization",
    status: "active",
    friendlyName: `AWS Organzation: ${organization.Id})`,
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
  return new Promise((resolve, reject) => {
    options.api.listOrganizationalUnitsForParent({ ParentId: options.rootId }, (err, data) => {
      if (err) {
        reject(new Error("Error loading organizational units from AWS API"));
      } else {
        resolve(data);
      }
    });
  });
}
const createPersonaFromOrganizationalUnit = async (data, options) => {
  const standardProps = {
    platform: "aws",
    type: "orgunit",
    id: `${data.Name}@${options.organizationId}`,
    status: "active",
    friendlyName: `AWS OrgUnit: ${data.Id})`,
  }
  const customProps = {
    arn: data.Arn,
    orgUnitId: data.Id,
  }

  const persona = await Persona.create(standardProps, customProps);
  Persona.addController(persona.upn, options.organizationUpn, 'system');
  return persona;
}

// Org Unit Accounts
const generateAccountPersonas = async (options) => {
  const personas = [];

  for (const orgUnit of options.organizationalUnits) {
    options.currentOrgUnitId = orgUnit.orgUnitId;
    options.currentOrgUnitUpn = orgUnit.upn;

    const cacheName = `aws-${options.integrationName}-orgunit-${orgUnit.orgUnitId}-accounts`;
    const data = await loadCached(loadAccounts, options, cacheName);

    for (const account of data.Accounts) {
      const persona = await createPersonaFromAccount(account, options);
      if (persona) {
        personas.push(persona);
      }
    }
  }
  return personas;
};
const loadAccounts = async (options) => {
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
    status: data.Id === "ACTIVE" ? "active" : "suspended",
    friendlyName: data.Name,
  };
  const customProps = {
    arn: data.Arn,
  };

  const persona = await Persona.create(standardProps, customProps);
  const emailPersona = Persona.addPersonaEmailAccount(data.Email);
  Persona.addController(persona.upn, emailPersona.upn, 'superadmin');
  Persona.addController(options.currentOrgUnitUpn, persona.upn, 'user');
  
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
