const Persona = {
  Properties: {
    UPN: "upn",                             // UPN - upn:<platform>:<type>:<id> - the universal persona name
    Id: "id",                               // Id - the unique platform-generated identifier
    Status: "status",                       // Status - system-level status of the account; default should be Active
    Platform: "platform",                   // Platform - system that provides the account (part of UPN)
    Type: "type",                           // Type - the type of account (part of UPN)
    FriendlyName: "friendlyName",           // FriendlyName - custom string to enable human-friendly read of this persona
    LastActive: "lastActive",               // datetime this persona was known to be used by the platform
    LastVerified: "lastVerified",           // datetime this persona was updated from the platform
    AuthenticationMin: "authenticationMin", // the minimum number of auth factors or members required to act as this persona
    Aliases: "aliases",                     // array of aliased personas
    Members: "members",                     // array of Membership objects listing children and the access level of the child
    ToDelete: "toDelete",                   // TODO: mark Personas for deletion in the database
    ToVerify: "toConfirm",                  // TODO: loaded from DB, but needs to be confirmed against system
  },
  Status: {
    Active: "active",
    Suspended: "suspended",
    Removed: "removed",
  },
  Platform: {
    Google: "google",
    Github: "github",
    Email: "email",
    Slack: "slack",
    Directory: "directory",
  },
  Type: {
    Participant: "participant",
    Activity: "activity",
    Account: "account",
    Workspace: "workspace",
    Organization: "organization",
    Orgunit: "orgunit",
    Group: "group",
    Role: "role",
    Team: "team",
    Repo: "repo",
    Channel: "channel",
  },
  Relationship: {
    Aliases: [],
    Members: {
      Properties: {
        Persona: "persona",
        AccessLevel: "accessLevel",
        AuthorizationMin: "authorizationMin", // the minimum number of auth factors or members required to act as this persona
      },
      AccessLevel: {
        None: "none",
        Read: "read",
        Guest: "guest",
        User: "user",
        Billing: "billing",
        Admin: "admin",
        SuperAdmin: "superadmin",
      },
    },
  },
}

Persona.localStore = {};

// generate the UPN for a persona object
Persona.generateUPN = (p) => {
  let platform = p[Persona.Properties.Platform];
  let type = p[Persona.Properties.Type];
  let id = p[Persona.Properties.Id];
  
  return Persona.generateUPNraw(platform, type, id);
}

Persona.generateUPNraw = (platform, type, id) => {
  if(platform && type && id) {
    return "upn:" + platform + ":" + type + ":" + id;
  }
}

Persona.addMember = (parentUpn, childUpn, accessLevel, authMin = 1) => {
  // check that parent exists in the store
  const parentPersona = Persona.localStore[parentUpn];
  if(!parentPersona){
    console.log(parentUpn + " persona not found, unable to add members...");
    return null;
  }

  // if member array does not exist already, create it
  if(!parentPersona[Persona.Properties.Members]){ 
    parentPersona[Persona.Properties.Members] = [];
  }

  // add member if it doesn't already exist
  const parentMembers = parentPersona[Persona.Properties.Members];
  const newMembership = {
    [Persona.Relationship.Members.Properties.Persona]: childUpn,
    [Persona.Relationship.Members.Properties.AccessLevel]: accessLevel,
    [Persona.Relationship.Members.Properties.AuthorizationMin]: authMin,
  }
  const newMembershipString = JSON.stringify(newMembership);

  let curMemberStrings = [];
  for(let i in parentMembers) { curMemberStrings.push(JSON.stringify(parentMembers[i])); }
  
  if(!curMemberStrings.includes(newMembershipString)) {
    parentMembers.push(newMembership);
  }

  return parentPersona;
}

// merge a persona into the existing local store, only updating included properties
Persona.updateStore = (p) => {
  let upn = p[Persona.Properties.UPN]
  // check that MVP exists
  if(!upn) { return null }

  // if the persona doesn't exist, create it and be done
  let curPersona = Persona.localStore[upn];
  if(!curPersona) { 
    Persona.localStore[upn] = p;
    return p;
  } 
  // else update properties
  for(let prop in p){
    if(!curPersona[prop]) { curPersona[prop] = p[prop] }
    else {
      // if the property does exist, update only if it is Aliases or Members
      let curElements = curPersona[prop];
      let newElements = p[prop];

      switch (prop) {
        case Persona.Properties.Members:
          let concatElements = [];
          let curElementStrings = [];
          let newElementStrings = [];
          for(let i in curElements) { curElementStrings.push(JSON.stringify(curElements[i])); }
          for(let i in newElements) { newElementStrings.push(JSON.stringify(newElements[i])); }
          for(let s in newElementStrings) {
            if(!curElementStrings.includes(newElementStrings[s])) {
              concatElements.push(JSON.parse(newElementStrings[s]))
            }
          }
          if(concatElements.length > 0){
            curElements.concat(concatElements);
          }
          break;
        case Persona.Properties.Aliases:
          for(let i in newElements) {
            if(!curElements.includes(newElements[i])) { curElements.push(newElements[i]); }
          }
          break;
      }
    } 
  }
  Persona.localStore[upn] = curPersona;
  return curPersona;
}

// adds/updates Email persona in local store; return merged persona
Persona.addPersonaEmailAccount = (email) => {
  const standardProps = {
    id: email.toLowerCase(),
    status: Persona.Status.Active,
    platform: Persona.Platform.Email,
    type: Persona.Type.Account,
    friendlyName: `Email Account: ${email}`,
  }
  return Persona.create(standardProps);
}

// Persona File Functions
Persona.connectAliasObjects = (persona, personaAlias) => {
  // create array if it does not exist
  if(!persona[Persona.Properties.Aliases]) { persona[Persona.Properties.Aliases] = []; }

  // add alias to persona
  persona[Persona.Properties.Aliases].push(personaAlias[Persona.Properties.UPN]);

  // save persona and return
  return Persona.updateStore(persona);
}

Persona.createAlias = (aliasId, standardProps, customProps = {}) => {
  const standardPropsAlias = {
    ...standardProps,
    id: aliasId,
    friendlyName: `${standardProps.friendlyName} [Alias: ${aliasId}]`,
  }
  const customPropsAlias = {
    ...customProps,
    primaryId: standardProps.id
  }
  return Persona.create(standardPropsAlias, customPropsAlias)
}

Persona.create = (standardProps = {id: "", status: "", platform: "", type: ""}, customProps = {}) => {
  const persona = {...customProps}

  persona[Persona.Properties.LastVerified] = new Date().toISOString()
  
  // Standard properties
  persona[Persona.Properties.Id] = String(standardProps.id)
  persona[Persona.Properties.Status] = standardProps.status
  persona[Persona.Properties.Platform] = standardProps.platform
  persona[Persona.Properties.Type] = standardProps.type
  if(standardProps.friendlyName) { persona[Persona.Properties.FriendlyName] = standardProps.friendlyName }
  // persona[Persona.Properties.FriendlyName] = standardProps.friendlyName

  persona[Persona.Properties.UPN] = Persona.generateUPN(persona)

  return Persona.updateStore(persona);
}

module.exports = { Persona };