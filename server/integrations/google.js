const {google} = require('googleapis');
const {Persona} = require('../utils/persona');
const {cache} = require('../utils/cache');

const Services = {};

async function generateAllPersonas(googleAuthInstance){

  const customer = googleAuthInstance.customer;
  const subjectEmail = googleAuthInstance.subjectEmail;
  const workspaceName = googleAuthInstance.workspaceName;
  const file = `./data/integrations/${googleAuthInstance.file}`;

  try {
    const startCount = Object.keys(Persona.localStore).length;
    console.log("Processing Google Personas");
      
    try {
      // process generation functions
      Services[customer] = await getGoogleService(file, subjectEmail);

      generateWorkspacePersona(customer, workspaceName);
    
      await generateUserPersonas(customer);
      await generateGroupPersonas(customer);

    } catch(e){
      console.log(e);
    }
  
    // calculate added items and cache output
    const loadCount = Object.keys(Persona.localStore).length - startCount;
    console.log("loaded " + loadCount + " personas associated with Google Workspace Customer " + customer + ".");

    await cache.save("allPersonas", Persona.localStore);
    return Persona.localStore;

  } catch(e){
    console.log(e);
  }
}

function generateWorkspacePersona(customer, workspaceName){
  const standardProps = {
    id: customer,
    status: "active",
    platform: "google",
    type: "workspace",
    friendlyName: `Google Workspace Customer: ${customer} (${workspaceName})`
  }
  Persona.create(standardProps);
  console.log("Generating Google Workspace Organization persona for " + customer);
}

function getWorkspaceUPN(customer){
  return Persona.generateUPN({
    platform: "google",
    type: "workspace",
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
      status: user.suspended ? "suspended" : "active",
      platform: "google",
      type: "account",
      friendlyName: `Google User: ${user.id} (${user.primaryEmail})`
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
        persona = Persona.connectAliasObjects(persona, emailPersona);
      }
    }

    // add recovery email as controller of this persona
    if(user.recoveryEmail){
      const recoveryEmailPersona = Persona.addPersonaEmailAccount(user.recoveryEmail);
      Persona.addController(persona.upn, recoveryEmailPersona.upn, "superadmin");
    }

    // add as controller of customer workspace
    let accessLevel;
    if(user.isAdmin){
      accessLevel = "superadmin";
    } else if(user.isDelegatedAdmin){
      accessLevel = "admin";
    } else {
      accessLevel = "user";
    }
    Persona.addController(workspaceUPN, persona.upn, accessLevel);

    // save updated persona
    Persona.updateStore(persona);
  }
}

async function generateGroupPersonas(customer){
  const loadConfig = {
    customer: customer,
    type: "groups",
  }
  const groups = await loadCached(loadGroups, loadConfig);

  const workspaceUPN = getWorkspaceUPN(customer);

  for(let i in groups){
    const group = groups[i];

    // load and add members to group
    group.members = await loadCached(loadMembers, {
      customer: customer, 
      type: "members", 
      selection: group.id,
    });

    // generate group persona
    const standardProps = {
      id: group.id,
      status: "active",
      platform: "google",
      type: "group",
      friendlyName: `Google Group: ${group.name} (${group.email})`
    }
    const customProps = {
      name: group.name,
      description: group.description,
    }
    // save initial persona
    let persona = Persona.create(standardProps, customProps);

    // add group primary email alias
    const emailPersona = Persona.addPersonaEmailAccount(group.email);
    persona = Persona.connectAliasObjects(persona, emailPersona);

    // generate and link email account personas
    if(groups.aliases || group.nonEditableAliases){
      for(let a in group.aliases){
        const alias = group.aliases[a];
        const aliasPersona = Persona.addPersonaEmailAccount(alias);
        persona = Persona.connectAliasObjects(persona, aliasPersona);
      }
      for(let a in group.nonEditableAliases){
        const alias = group.nonEditableAliases[a];
        const aliasPersona = Persona.addPersonaEmailAccount(alias);
        persona = Persona.connectAliasObjects(persona, aliasPersona);
      }
    }

    // add as controller of customer workspace
    let accessLevel = "indirect";
    Persona.addController(workspaceUPN, persona.upn, accessLevel);

    // add group members to group persona
    for(let i in group.members){
      const member = group.members[i];

      // TODO - WORKAROUND: currently bypasses all-org users in Group membership
      if(member.type==="CUSTOMER") { continue; }

      const memberPersona = await generateGroupMemberPersona(member);
      let accessLevel = "user";
      switch (member.role) {
        case "OWNER":
          accessLevel = "superadmin";
          break;
        case "MANAGER":
          accessLevel = "admin";
          break;
      }
      Persona.addController(persona.upn, memberPersona.upn, accessLevel);
    }

    // save updated persona
    Persona.updateStore(persona);
  }
}

async function generateGroupMemberPersona(member){

  let type, typeString, status;

  switch(member.type){
    case "USER":
      type = "account";
      typeString = "User";
      break;
    case "GROUP":
      type = "group";
      typeString = "Group";
      break;
    case "CUSTOMER":
      // members can be the entire org!
      // TODO: enable this use case
      return null;
  }

  switch(member.status){
    case "SUSPENDED":
      status = "suspended";
      break;
    default:
      status = "active";
      break;
  }

  // generate member persona
  const standardProps = {
    id: member.id,
    status: status,
    platform: "google",
    type: type,
    friendlyName: `Google ${typeString}: ${member.id} (${member.email})`
  }

  // save initial persona, but do no overwrite props if they already exist
  let persona = Persona.create(standardProps, {}, { canonical: "false"});

  // add member primary email alias
  const emailPersona = Persona.addPersonaEmailAccount(member.email);
  if(!emailPersona){
    console.log("Failed to generate email persona for: " + JSON.stringify(member));
  } else {
    persona = Persona.connectAliasObjects(persona, emailPersona);
  }

  // save and return updated persona
  return Persona.updateStore(persona);
}

async function loadUsers(config){
  return await apiCall(config);
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
  customer = options.customer;
  if(!customer){ customer = "";}

  let cacheName = 'google-' + customer + "-" + func.name;

  if(options.selection) {
    cacheName += "-" + options.selection;
  }

  const cacheElements = await cache.load(cacheName);
  let elements = [];
  
  if(cacheElements){
    console.log("Found cache " + cacheName);
    elements = cacheElements;
  } else {
    console.log("No cache found for " + cacheName + ", attempting to load...");
    elements = await func(options);
    await cache.save(cacheName, elements);
  }
  return elements;
}

async function getGoogleService(file, subjectEmail){

  const auth = new google.auth.JWT({
    keyFile: file,
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

    let elements = response.data[type];

    for (let i in elements) {
      let id = elements[i].id;
      allElements[id] = elements[i];
    }
    pageToken = response.data.nextPageToken;
  } while (pageToken);

  console.log('Found ' + allElements.length + ' ' + type + ' elements.');

  return allElements;
}

const googleIntegration = {
  generateAllPersonas,
}

module.exports = { 
  googleIntegration,
};
