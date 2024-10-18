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

core.init = async () => {
  if(core.ready) { 
    return core; 
  }

  for(const module in coreModules) {
    calls[module] = await coreModules[module]()
    core[module] = {};

    console.log("Core: loading module: ", module)

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
  core.ready = true;
  console.log("Core: initialized")
  return core;
}

function getCallingFolder(stack) {
  const callerFile = stack.split('\n')[2].trim().match(/\((.*):\d+:\d+\)/)[1];
  const folderName = path.basename(path.dirname(callerFile));
  return folderName;
}

module.exports = core;