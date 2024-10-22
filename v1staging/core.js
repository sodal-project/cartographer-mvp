const path = require('path');

const core = {
  ready: false,
  init: null,
  mod: {},
};

const namespaces = {
  graph: require('./graph.js'),
  persona: require('./persona.js'),
  sourceStore: require('./sourceStore.js'),
  check: require('./check.js'),
  constants: require('./constants.js'),
};

const externalModules = {
  csv: () => require('./modCsvIntegration.js'),
  slack: () => require('./modSlackIntegration.js'),
}

const calls = {};

core.init = async () => {
  if(core.ready) { 
    return core; 
  }

  initNamespaces();
  await initModules();
  //
  // finalize core and freeze
  //
  core.ready = true;
  Object.freeze(core);
  console.log(`Core frozen status: ${Object.isFrozen(core)}`)
  console.log("Core: initialized")
  return core;
}

function initNamespaces() {
  //
  // load namespace calls to core
  //
  for(const module in namespaces) {
    calls[module] = namespaces[module]
    core[module] = {};

    console.log("Core: loading internal module: ", module)

    for(const call in calls[module]) {
      if(call === 'default') { continue; }

      if(typeof calls[module][call] === 'function') {
        console.log(`Core: adding function: core.${module}.${call}`)
        core[module][call] = (...params) => {

          const folder = getCallingFolder(new Error().stack);
          console.log(`Core: calling function: ${call} from ${module} in ${folder}`)
          
          return calls[module][call](...params);
        }
      } else {
        console.log(`Core: adding object: core.${module}.${call}`)
        core[module][call] = calls[module][call];
      }
    }
  }
}

async function initModules() {
  // 
  // load external module calls to core.mod
  // 
  for(const module in externalModules) {
    calls[module] = await externalModules[module]()
    core.mod[module] = {};

    console.log("Core: loading external module: ", module)

    for(const call in calls[module]) {
      if(call === 'default') { 
        continue; 
      } else if(call === 'init') {
        await calls[module][call]();
        continue;
      } else {
        if(typeof calls[module][call] === 'function') {
          console.log(`Core: adding function: core.mod.${module}.${call}`)
          core.mod[module][call] = (...params) => {
            const folder = getCallingFolder(new Error().stack);
            console.log(`Core: calling function: ${call} from ${module} in ${folder}`)
            return calls[module][call](...params);
          }
        } else {
          console.log(`Core: adding object: core.mod.${module}.${call}`)
          core.mod[module][call] = calls[module][call];
        }
      }
    }
  }
}

function getCallingFolder(stack) {
  const callerFile = stack.split('\n')[2].trim().match(/\((.*):\d+:\d+\)/)[1];
  const folderName = path.basename(path.dirname(callerFile));
  return folderName;
}

module.exports = core;