const path = require('path');

const core = {};
const calls = {};
core.ready = false;
const coreModules = {
  graph: () => import('./graph.js'),
  persona: () => import('./persona.js'),
  sourceStore: () => import('./sourceStore.js'),
  check: () => import('./check.js'),
  constants: () => import('./constants.js'),
};

const externalModules = {
  csv: () => import('./modCsvIntegration.js'),
  slack: () => import('./modSlackIntegration.js'),
}

core.init = async () => {
  if(core.ready) { 
    return core; 
  }

  //
  // load internal module calls to core
  //
  for(const module in coreModules) {
    calls[module] = await coreModules[module]()
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

  // 
  // load external module calls to core.mod
  // 
  core.mod = {};
  for(const module in externalModules) {
    calls[module] = await externalModules[module]()
    core.mod[module] = {};

    console.log("Core: loading external module: ", module)

    for(const call in calls[module]) {
      if(call === 'default') { continue; }

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

  //
  // finalize core and freeze
  //
  core.ready = true;
  Object.freeze(core);
  console.log(`Core frozen status: ${Object.isFrozen(core)}`)
  console.log("Core: initialized")
  return core;
}

function getCallingFolder(stack) {
  const callerFile = stack.split('\n')[2].trim().match(/\((.*):\d+:\d+\)/)[1];
  const folderName = path.basename(path.dirname(callerFile));
  return folderName;
}

module.exports = core;