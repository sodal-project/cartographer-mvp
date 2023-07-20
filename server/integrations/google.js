require('dotenv').config();

const {google} = require('googleapis');
const {Persona} = require('../utils/persona');
const {cache} = require('../utils/cache');

const Services = {};

async function generateAllPersonas(customer){
  //TODO - enable dynamic loads
  customer = "C03w1wf6q";

  const workspaceName = "Protocol Labs";
  const keyFile = "./data/_auth/google-" + customer + "-credentials.json";
  const subjectEmail = "andrew.schwab@protocol.ai";

  try {
    const startCount = Object.keys(Persona.localStore).length;
    console.log("Processing Google Personas");
      
    try {
      // process generation functions
      Services[customer] = await getGoogleService(keyFile, subjectEmail);

      generateWorkspacePersona(customer, workspaceName);
    
      await generateUserPersonas(customer);

    } catch(e){
      console.log(e);
    }
  
    // calculate added items and cache output
    const loadCount = Object.keys(Persona.localStore).length - startCount;
    console.log("loaded " + loadCount + " personas associated with Github");

    await cache.save("allPersonas", Persona.localStore);
    return Persona.localStore;

  } catch(e){
    console.log(e);
  }
}

function generateWorkspacePersona(customer, workspaceName){
  const standardProps = {
    id: customer,
    status: Persona.Status.Active,
    platform: Persona.Platform.Google,
    type: Persona.Type.Workspace,
    friendlyName: `Google Workspace Customer: ${customer} (${workspaceName})`
  }
  const persona = Persona.create(standardProps);
  console.log(persona);
}

function getWorkspaceUPN(customer){
  return Persona.generateUPN({
    platform: Persona.Platform.Google,
    type: Persona.Type.Workspace,
    id: customer,
  });
}

async function generateUserPersonas(customer){

  const loadConfig = {
    customer: customer,
    type: "users",
  }
  const users = await loadCached(loadUsers, loadConfig);

  const workspaceUPN = getWorkspaceUPN(customer);

  for(let i in users){
    const user = users[i];

    // generate user persona
    const standardProps = {
      id: user.id,
      status: user.suspended ? Persona.Status.Suspended : Persona.Status.Active,
      platform: Persona.Platform.Google,
      type: Persona.Type.Account,
      friendlyName: `Google Workspace User: ${user.id} (${user.primaryEmail})`
    }
    const customProps = {
      firstname: user.name?.givenName,
      lastname: user.name?.familyName,
      authenticationMin: user.isEnrolledIn2Sv ? 2 : 1,
      lastActive: user.lastLoginTime,
    }
    // save initial persona
    let persona = Persona.create(standardProps, customProps);

    // generate and link user email account personas
    if(user.emails){
      for(let j in user.emails){
        const email = user.emails[j].address;
        const emailPersona = Persona.addPersonaEmailAccount(email);
        Persona.updateStore(emailPersona);
        persona = Persona.connectAliasObjects(persona, emailPersona);
      }
    }
    // save updated persona
    Persona.updateStore(persona);

    // add recovery email as member of this persona
    if(user.recoveryEmail){
      const recoveryEmailPersona = Persona.addPersonaEmailAccount(user.recoveryEmail);
      Persona.updateStore(recoveryEmailPersona);
      Persona.addMember(persona.upn, recoveryEmailPersona.upn, Persona.Relationship.Members.AccessLevel.SuperAdmin);
    }

    // add as member of customer workspace
    let accessLevel;
    if(user.isAdmin){
      accessLevel = Persona.Relationship.Members.AccessLevel.SuperAdmin;
    } else if(user.isDelegatedAdmin){
      accessLevel = Persona.Relationship.Members.AccessLevel.Admin;
    } else {
      accessLevel = Persona.Relationship.Members.AccessLevel.User;
    }
    Persona.addMember(workspaceUPN, persona.upn, accessLevel);

    // save updated persona
    Persona.updateStore(persona);
  }
}

async function generateGroupPersonas(customer){
}

async function generateGroupMemberPersonas(customer, groupKey){
}

async function loadUsers(config){
  const users = await apiCall(config);
  return users;
}

async function loadGroups(config){
  const groups = await apiCall(config);
  return groups;
}

async function loadMembers(config){
  const members = await apiCall(config);
  return members;
}

async function loadCached(func, options){
  customer = options?.customer;
  if(!customer){ customer = "";}

  const cacheName = 'google-' + customer + "-" + func.name;

  const cacheElements = await cache.load(cacheName);
  let elements = [];
  
  if(cacheElements){
    console.error("Found cache " + cacheName);
    elements = cacheElements;
  } else {
    console.error("No cache found for " + cacheName + ", attempting to load...");
    elements = await func(options);
    await cache.save(cacheName, elements);
  }
  return elements;
}

async function getGoogleService(keyFile, subjectEmail){

  const auth = new google.auth.JWT({
    keyFile: keyFile,
    subject: subjectEmail,
    scopes: [
      'https://www.googleapis.com/auth/admin.directory.user.readonly',
      'https://www.googleapis.com/auth/admin.directory.domain.readonly',
      'https://www.googleapis.com/auth/admin.directory.group.readonly',
    ],
  })
  const service = google.admin({version: 'directory_v1', auth: auth});

  return service;
}

// TODO: remove googleapis dependency
// options { 
//   customer: string  
//   type: users | groups | members,
//   selection: string (optional)
// }
// returns array of object types
async function apiCall(config){

  const allElements = {};

  let service = Services[config.customer];

  let pageToken;
  let response;
  let elements;
  let customer = config.customer;
  let groupKey = config.selection;
  let type = config.type;

  let request = {
    customer: customer,
    maxResults: 100,
    groupKey: groupKey,
  }

  do {
    request.pageToken = pageToken;

    response = await service[type].list(request);
    elements = response.data[type];

    if (!elements) {
      console.error('No ' + type + ' elements found.');
      return;
    } 
    for (const e of elements) {
      allElements[e.id] = e;
    }
    pageToken = response.data.nextPageToken;
  } while (pageToken);

  console.error('Found ' + allElements.length + ' ' + type + ' elements.');

  return allElements;
}

const googleIntegration = {
  generateAllPersonas,
}

module.exports = { 
  googleIntegration,
};
