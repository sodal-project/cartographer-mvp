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

Persona.addController = (subordinateUpn, controllerUpn, accessLevel, authMin = 1) => {
  // check that parent exists in the store
  const subordinatePersona = Persona.localStore[subordinateUpn];
  if(!subordinatePersona){
    console.log(subordinateUpn + " persona not found, unable to add controllers...");
    return null;
  }

  // if controller array does not exist already, create it
  if(!subordinatePersona["controllers"]){ 
    subordinatePersona["controllers"] = [];
  }

  // add controller if it doesn't already exist
  const subordinateControllers = subordinatePersona["controllers"];
  const newController = {
    "controllerUpn": controllerUpn,
    "accessLevel": accessLevel,
    "authorizationMin": authMin,
  }
  const newControllerString = JSON.stringify(newController);

  let curControllerStrings = [];
  for(let i in subordinateControllers) { curControllerStrings.push(JSON.stringify(subordinateControllers[i])); }
  
  if(!curControllerStrings.includes(newControllerString)) {
    subordinateControllers.push(newController);
  }

  return subordinatePersona;
}

// merge a persona into the existing local store, only updating included properties
Persona.updateStore = (p) => {
  let upn = p["upn"]
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
      // if the property does exist, update only if it is Aliases or Controller
      let curElements = curPersona[prop];
      let newElements = p[prop];

      switch (prop) {
        case "friendlyName":
        case "status":
          // only overwrite friendlyName and status if it is not blank
          if(newElements !== "") { curPersona[prop] = newElements; }
          break;
        case "controllers":
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
        case "aliases":
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
  if(!persona["aliases"]) { persona["aliases"] = []; }

  // add alias to persona
  persona["aliases"].push(personaAlias["upn"]);

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
  return Persona.create(standardPropsAlias, customPropsAlias)
}

Persona.create = (standardProps = {id: "", status: "", platform: "", type: "", friendlyName: ""}, customProps = {}) => {
  const persona = {...customProps}

  persona["lastVerified"] = new Date().toISOString()
  
  // Standard properties
  persona["id"] = String(standardProps.id)
  persona["status"] = standardProps.status
  persona["platform"] = standardProps.platform
  persona["type"] = standardProps.type
  persona["friendlyName"] = standardProps.friendlyName

  persona["upn"] = Persona.generateUPN(persona)

  return Persona.updateStore(persona);
}

Persona.createFromUPN = (upn) => {
  const standardProps = {
    platform: upn.split(":")[1],
    type: upn.split(":")[2],
    id: upn.split(":")[3],
  }
  return Persona.create(standardProps);
}

module.exports = { Persona };