const CC = require('./constants');
const check = require('./check');

const read = (upn) => {

}

const newPersona = (platform, type, id, optionalParams) => {
  if(!platform || !type || !id) { return null; }

  let persona = {
    upn: generateUpnRaw(platform, type, id),
    platform: platform,
    type: type,
    id: String(id),
    obey: [],
    control: [],
  };

  if(optionalParams) {
    persona = {...persona, ...optionalParams};
  }

  check.personaObject(persona);

  return persona;
}

const newFromEmail = (email) => {
  return newPersona(CC.PLATFORM.EMAIL, CC.TYPE.ACCOUNT, email);
}

const newFromUpn = (upn) => {

  const platform = upn.split(":")[1];
  const type = upn.split(":")[2];
  const id = upn.split(":")[3];

  return newPersona(platform, type, id);
}

const setControl = (persona, controlledUpn, level, confidence = CC.CONFIDENCE['MEDIUM-ASSERTED'], optionalParams) => {
  if(!persona || !controlledUpn || !level) { return null; }

  let control = {
    upn: controlledUpn,
    level: level,
    confidence: confidence,
  }

  if(optionalParams) {
    control = {...control, ...optionalParams};
  }

  if(!persona.control) {
    persona.control = [];
  }

  persona.control.push(control);
  
  check.personaObject(persona);

  return persona;
}

const setObey = (persona, controllingUpn, level, confidence = CC.CONFIDENCE['MEDIUM-ASSERTED'], optionalParams) => {
  if(!persona || !controllingUpn || !level) { return null; }

  let obey = {
    upn: controllingUpn,
    level: level,
    confidence: confidence,
  }

  if(optionalParams) {
    obey = {...obey, ...optionalParams};
  }

  if(!persona.obey) {
    persona.obey = [];
  }

  persona.obey.push(obey);

  check.personaObject(persona);
  
  return persona;
}

const getProps = (persona) => {
  if(!persona) { return null; }

  const props = {...persona};
  delete props.control;
  delete props.obey;

  return props;
}

const getRelationships = (persona) => {
  if(!persona) { return null; }
  
  try {
    check.personaObject(persona);
  } catch (error) {
    console.log('Error checking persona object: \n' + error);
  }

  const relationships = [];

  if(!persona.control) { persona.control = []; }
  for(const rel of persona.control) {
    const newRel = {...rel};
    newRel.controlUpn = persona.upn;
    newRel.obeyUpn = rel.upn;
    delete newRel.upn;
    check.relationshipObject(newRel);
    relationships.push(newRel);
  }

  if(!persona.obey) { persona.obey = []; }
  for(const rel of persona.obey) {
    const newRel = {...rel};
    newRel.controlUpn = rel.upn;
    newRel.obeyUpn = persona.upn;
    delete newRel.upn;
    check.relationshipObject(newRel);
    relationships.push(newRel);
  }

  return relationships;
}

const merge = (source, persona) => {
}

const generateUpnRaw = (platform, type, id) => {
  const newUpn = "upn:" + platform + ":" + type + ":" + id;
  check.upnString(newUpn);
  return newUpn;
}

module.exports = {
  read,
  newPersona,
  newFromEmail,
  newFromUpn,
  getRelationships,
  getProps,
  setControl,
  setObey,
  merge,
}