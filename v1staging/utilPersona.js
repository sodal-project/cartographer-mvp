const CC = require('./utilConstants');

const read = (upn) => {

}

const newPersona = (platform, type, id, optionalParams) => {
  if(!platform || !type || !id) { return null; }

  let persona = {
    upn: generateUPNraw(platform, type, id),
    platform: platform,
    type: type,
    id: String(id),
    obey: [],
    control: [],
  };

  if(optionalParams) {
    persona = {...persona, ...optionalParams};
  }

  return persona;
}

const newFromEmail = (email) => {
  return createPersona(CC.PLATFORM.EMAIL, CC.TYPE.ACCOUNT, email);
}

const newFromUPN = (upn) => {

  const platform = upn.split(":")[1];
  const type = upn.split(":")[2];
  const id = upn.split(":")[3];

  return createPersona(platform, type, id);
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
  
  return persona;
}

const setAlias = (persona, aliasUpn, confidence = CC.CONFIDENCE['HIGH-PROVEN']) => {
  if(!persona || !aliasPersona) { return null; }

  return setControl(persona, aliasUpn, CC.LEVEL.ALIAS, confidence);
}

const addToGraph = (source, persona) => {
}

const generateUPNraw = (platform, type, id) => {
  if (platform && type && id) {
    return "upn:" + platform + ":" + type + ":" + id;
  }
}

module.exports = {
  read,
  newPersona,
  newFromEmail,
  newFromUPN,
  setControl,
  setObey,
  setAlias,
  addToGraph,
}