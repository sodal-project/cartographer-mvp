const Persona = {}

Persona.localStore = {};

// generate the UPN for a persona object
Persona.generateUPN = (p) => {
  let platform = p["platform"];
  let type = p["type"];
  let id = p["id"];
  
  return Persona.generateUPNraw(platform, type, id);
}

Persona.generateUPNraw = (platform, type, id) => {
  if(platform && type && id) {
    return "upn:" + platform + ":" + type + ":" + id;
  }
}

Persona.addController = (subordinateUpn, controllerUpn, accessLevel, authorizationMin = 1) => {
  
  // check that personas exists in the store
  // if they do not exist, create them
  let subordinatePersona = Persona.localStore[subordinateUpn];
  let controllerPersona = Persona.localStore[controllerUpn];

  if(!subordinatePersona){
    subordinatePersona = Persona.createFromUPN(subordinateUpn);
  }
  if(!controllerPersona){
    controllerPersona = Persona.createFromUPN(controllerUpn);
  }

  // if controller array does not exist already, create it
  if(!subordinatePersona.hasOwnProperty("controllers")){ 
    subordinatePersona["controllers"] = {};
  }

  // add relationship if it doesn't already exist
  subordinatePersona.controllers[controllerUpn] = {
    "controllerUpn": controllerUpn,
    "accessLevel": accessLevel,
    "authorizationMin": authorizationMin,
  }

  return subordinatePersona;
}

// merge a persona into the existing local store, only updating included properties
Persona.updateStore = (p) => {
  let upn = p["upn"]
  // check that MVP exists
  if(!upn) { return null }

  const canonical = p.metadata.canonical;

  // if the persona doesn't exist, create it and be done
  let curPersona = Persona.localStore[upn];
  if(!curPersona) { 
    Persona.localStore[upn] = p;
    return p;
  } 
  // else update properties
  for(let prop in p){
    // if(p[prop] === "") { continue; } // skip blank properties
    if(!curPersona[prop]) {
      curPersona[prop] = p[prop];
    }
    else {
      // update properties if necessary
      let curElements = curPersona[prop];
      let newElements = p[prop];

      switch (prop) {
        case "controllers":
          for(let i in newElements) {
            if(!curElements[i]) { curElements[i] = newElements[i]; }
          }
          break;
        case "aliases":
          for(let i in newElements) {
            if(!curElements.includes(newElements[i])) { curElements.push(newElements[i]); }
          }
          break;
        case "upn":
        case "id":
        case "platform":
        case "type":
          break;
        default:
          if(canonical) { curPersona[prop] = p[prop]; }
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
    status: "active",
    platform: "email",
    type: "account",
    friendlyName: `Email Account: ${email}`,
  }
  return Persona.create(standardProps);
}

// Persona File Functions
Persona.connectAliasObjects = (persona, personaAlias) => {
  // create array if it does not exist
  if(!persona.aliases) { persona.aliases = []; }

  // add alias to persona if it does not exist
  if(!persona.aliases.includes(personaAlias.upn)) { persona.aliases.push(personaAlias["upn"]); }

  // save persona and return
  return Persona.updateStore(persona);
}

Persona.createAlias = (aliasId, standardProps, customProps = {}) => {
  const standardPropsAlias = {
    ...standardProps,
    id: aliasId,
    friendlyName: `${standardProps.friendlyName} (Alias: ${aliasId})`,
  }
  const customPropsAlias = {
    ...customProps,
    primaryId: standardProps.id
  }
  const primaryPersona = Persona.create(standardProps, {}, {canonical: false});
  const aliasPersona = Persona.create(standardPropsAlias, customPropsAlias);
  Persona.connectAliasObjects(primaryPersona, aliasPersona);
  return aliasPersona;
  
}

Persona.create = (standardProps = {id: "", status: "", platform: "", type: "", friendlyName: ""}, customProps = {}, metadata = { canonical: "true"}) => {
  const persona = {...customProps}

  persona.lastVerified = new Date().toISOString()

  // Standard properties
  persona.id = String(standardProps.id)
  persona.status = standardProps.status
  persona.platform = standardProps.platform
  persona.type = standardProps.type
  persona.friendlyName = standardProps.friendlyName
  persona.metadata = metadata

  persona.upn = Persona.generateUPN(persona)

  return Persona.updateStore(persona);
}

Persona.createFromUPN = (upn) => {

  const platform = upn.split(":")[1];
  const type = upn.split(":")[2];
  const id = upn.split(":")[3];

  const standardProps = {
    platform: platform,
    type: type,
    id: id,
    friendlyName: `${platform} ${type}: ${id}`,
    status: "active",
  }
  const persona = Persona.create(standardProps, {}, {canonical: false});
  return persona;
}

module.exports = { Persona };