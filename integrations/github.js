require('dotenv').config();

const {Octokit} = require('@octokit/rest');
const {Persona} = require('../utils/persona');
const {cache} = require('../utils/cache');

let octokit = null;

// TODO: pass in auth token as parameter
async function generateAllPersonas(integration) {
  octokit = new Octokit({
    auth: integration.token,
  });

  try {
    const startCount = Object.keys(Persona.localStore).length;
    console.log("Processing Github Orgs");

    const orgs = await loadCached(loadOrgs, { apiKey: integration.token });
    generateOrgPersonas(orgs);

    console.log("Processing Github Users and Teams");
    for(let org in orgs){
      let curOrg = orgs[org];
      let orgLogin = curOrg.login;
      let orgUPN = Persona.generateUPNraw(
        "github",
        "organization",
        curOrg.id,
      )
      console.log("Processing users for " + curOrg.login + " (" + orgUPN + ")");
      
      try {

        // process users (without email)
        const users = await loadCached(loadUsers, {orgLogin: orgLogin});
        generateUserPersonas(users, orgUPN);
        
        // process users (with email)
        const usersWithEmail = await loadCached(loadUserEmails, {orgLogin: orgLogin, userArray: users});
        generateUserPersonas(usersWithEmail, orgUPN);

        // process teams
        const teams = await loadCached(loadTeams, {orgLogin: orgLogin});
        generateTeamPersonas(teams, orgUPN);

        // process repos
        const reposdata = await loadCached(loadRepos, {orgLogin: orgLogin});
        const repos = reposdata.data;
        generateRepoPersonas(repos, orgUPN);

        await generateRepoCollaborators(repos, orgUPN);
        await generateRepoTeams(repos, orgUPN);

      } catch(e){
        if(e.status){
          console.log(e.status);
          console.log(e.data.message);
          console.log(e.data.documentation_url);
        } else {
          console.log(e);
        }
      }
    }

    return Persona.localStore;

  } catch(e){
    console.log(e);
  }
}

function generateOrgPersonas(orgs) {
  for(let curOrg in orgs){
    let org = orgs[curOrg];

    // Create Github Org Persona Object
    const standardProps = {
      id: org.id,
      status: "active",
      platform: "github",
      type: "organization",
      friendlyName: `${org.login}`,
    }
    const aliasProps = {
      id: org.login.toLowerCase(),
      status: "active",
      platform: "github",
      type: "organization",
      friendlyName: `${org.login}`,
    }
    const customProps = {
      login: org.login.toLowerCase(),
      githubName: org.name,
      githubDescription: org.description,
    }
    const persona = Persona.create(standardProps, customProps);
    const alias = Persona.create(aliasProps, customProps); 
    Persona.connectAliasObjects(persona, alias);
  }
}

function generateUserPersonas(users, orgUPN) {
  for(let user in users){
    let curUser = users[user];

    // Create Github User Persona Object
    const standardProps = {
      id: curUser.id,
      status: "active",
      platform: "github",
      type: "account",
      friendlyName: `${curUser.login}`
    }
    const aliasProps = {
      id: curUser.login.toLowerCase(),
      status: "active",
      platform: "github",
      type: "account",
      friendlyName: `${curUser.login}`
    }
    const persona = Persona.create(standardProps);
    const alias = Persona.create(aliasProps);
    const connectedPersona = Persona.connectAliasObjects(persona, alias);

    // BELOW HERE NEEDS REFACTORING
    // ---------------------------------------------
    // add email controller if applicable (omit Github noreply emails)
    if(curUser.email && !curUser.email.includes("noreply.github.com")){
      let controllerPersonaUPN = Persona.addPersonaEmailAccount(curUser.email)["upn"];
      Persona.addController(persona["upn"], controllerPersonaUPN, "superadmin");
    }

    // add as controller of org and system controlled by org
    if(orgUPN){
      let accessLevel;
      switch (curUser.role) {
        case "admin":
          accessLevel = "superadmin";
          break;
        case "member":
          accessLevel = "user";
          break;
        case "guest":
          accessLevel = "guest";
          break;
      }
      if(!accessLevel){
        console.log("No access level found for Github user " + curUser.login + " in org " + orgUPN + ")");
      } else {
        Persona.addController(orgUPN, persona["upn"], accessLevel);
        // Persona.addController(persona.upn, orgUPN, "system");
      }
    }
    
    // store persona
    Persona.updateStore(persona);
  }
}

function generateTeamPersonas(teams, orgUPN) {
  for(let team in teams){
    let curTeam = teams[team];

    // Exit early if persona already exists
    if(!Persona.localStore[orgUPN]){ 
      console.log("No org persona found in localStore for Github team " + curTeam.slug + " (" + curTeam.id + ")");
      return null;
    }

    const orgPersona = Persona.localStore[orgUPN];

    // Create Github Team Persona Object
    const standardProps = {
      id: curTeam.id,
      status: "active",
      platform: "github",
      type: "team",
      friendlyName: `${curTeam.slug}@${orgPersona.login}`
    }
    const aliasProps = {
      id: `${curTeam.slug}@${orgPersona.login}`.toLowerCase(),
      status: "active",
      platform: "github",
      type: "team",
      friendlyName: `${curTeam.slug}@${orgPersona.login}`
    }
    const customProps = {
      privacy: curTeam.privacy,
      permission: curTeam.permission,
    }
    const persona = Persona.create(standardProps, customProps);
    const alias = Persona.create(aliasProps, customProps);
    Persona.connectAliasObjects(persona, alias)

    // BELOW HERE NEEDS REFACTORING
    // ---------------------------------------------
    const upn = persona["upn"];

    // add as controlled by the org
    Persona.addController(upn, orgUPN, "system");

    // add members as controllers
    if(curTeam.members){
      curTeam.members.forEach(member => {
        let accessLevel = "user";
        if(member.role === "maintainer"){
          accessLevel = "superadmin";
        }
        const controllerPersonaUPN = Persona.generateUPNraw("github", "account", member.id);
        Persona.addController(upn, controllerPersonaUPN, accessLevel);
      });
    }

    // add subTeams
    if(curTeam.subTeams){
      // console.log("found " + curTeam.subTeams + " for " + slug);
      let teamAccessLevel = "user";
      curTeam.subTeams.forEach(subteam => {
        const subteamPersonaUPN = Persona.generateUPNraw("github", "team", subteam.id);
        Persona.addController(upn, subteamPersonaUPN, teamAccessLevel);
      });
    }

    // store and return persona
    Persona.updateStore(persona);
  }
}

function generateRepoPersonas(repos, orgUPN){
  for(let repo in repos){
    let curRepo = repos[repo];

    // Create Github Repo Persona Object
    const standardProps = {
      id: curRepo.id,
      status: "active",
      platform: "github",
      type: "repo",
      friendlyName: `${curRepo.name}@${curRepo.owner.login}`.toLowerCase()
    }
    const aliasProps = {
      id: `${curRepo.name}@${curRepo.owner.login}`.toLowerCase(),
      status: "active",
      platform: "github",
      type: "repo",
      friendlyName: `${curRepo.name}@${curRepo.owner.login}`.toLowerCase()
    }
    const customProps = {
      visibility: curRepo.visibility,
      name: curRepo.name,
      archived: curRepo.archived,
      disabled: curRepo.disabled,
      default_branch: curRepo.default_branch,
      description: curRepo.description,
    }
    const persona = Persona.create(standardProps, customProps);
    const alias = Persona.create(aliasProps, customProps);
    Persona.connectAliasObjects(persona, alias);

    // add as controlled by the org
    Persona.addController(persona.upn, orgUPN, "system");

    // passthrough org member control to the repo
    let accessLevel = "";
    if(curRepo.permissions.admin){
      accessLevel = "superadmin";
    } else if (curRepo.permissions.push){
      accessLevel = "user";
    } else if (curRepo.permissions.pull){
      accessLevel = "user";
    }
    if(accessLevel !== ""){
      Persona.addController(persona.upn, orgUPN, accessLevel);
    }

    // store and return persona
    Persona.updateStore(persona);
  }
}

async function generateRepoCollaborators(repos, orgUPN){
  for(let repo in repos){
    let curRepo = repos[repo];
    const repoUPN = Persona.generateUPNraw("github", "repo", curRepo.id);

    const options = {
      orgLogin: curRepo.owner.login,
      repo: curRepo.name,
      suffix: curRepo.name.toLowerCase(),
    }
    let response = await loadCached(loadRepoCollaborators, options);

    for(let collaborator in response.data){
      let curCollaborator = response.data[collaborator];

      let accessLevel = "user";
      if(curCollaborator.permissions.admin){
        accessLevel = "superadmin";
      } else if (curCollaborator.permissions.maintain){
        accessLevel = "admin";
      }

      const controllerPersonaUPN = Persona.generateUPNraw("github", "account", curCollaborator.id);
      Persona.addController(repoUPN, controllerPersonaUPN, accessLevel);
    }
    Persona.addController(repoUPN, orgUPN, "system");
  }
}

async function generateRepoTeams(repos, orgUPN){
  for(let repo in repos){
    let curRepo = repos[repo];
    const repoUPN = Persona.generateUPNraw("github", "repo", curRepo.id);

    const options = {
      orgLogin: curRepo.owner.login,
      repo: curRepo.name,
      per_page: 100,
      suffix: curRepo.name.toLowerCase(),
    }
    let response = await loadCached(loadRepoTeams, options);

    for(let team in response.data){
      let curTeam = response.data[team];

      let accessLevel = "read";
      switch (curTeam.permission) {
        case "push":
        case "triage":
          accessLevel = "user";
          break;
        case "maintain":
          accessLevel = "admin";
          break;
        case "admin":
          accessLevel = "superadmin";
          break;
      }

      const teamPersonaUPN = Persona.generateUPNraw("github", "team", curTeam.id);
      Persona.addController(repoUPN, teamPersonaUPN, accessLevel);
    }
    Persona.addController(repoUPN, orgUPN, "system");
  }
}

async function loadCached(func, options = {}){
  try {
    let orgLogin = options.orgLogin;
    let suffix = options.suffix ? "-" + options.suffix : "";
  
    if(!orgLogin){ orgLogin = "";} 
    const cacheName = 'github-' + orgLogin + "-" + func.name + suffix;
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
  } catch(e){
    console.error(e);
  }
}

async function loadOrgs(options) {
  let orgs = [];

  /*let response = await octokit.request('GET /user/orgs', {
    headers: {
      'X-GitHub-Api-Version': '2022-11-28'
    }
  })*/

  let response = await fetch('https://api.github.com/user/orgs', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${options.apiKey}`,
      'Accept': 'application/vnd.github.v3+json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
  });

  if (response.status !== 200) {
    throw new Error(`Error: ${response.status} - ${response.statusText}`);
  }

  const responseData = await response.json();

  for(const i in responseData){
    let curOrg = responseData[i];

    let orgRequest = await octokit.request('GET /orgs/{org}', {org: curOrg.login});

    let orgDetails = orgRequest.data;
    console.error("Found org: " + orgDetails.login);
    orgs.push(orgDetails);
  }
  return orgs;
}

async function loadUsers(options) {
  const orgLogin = options.orgLogin;
  let users = [];

  options = {
    org: orgLogin,
    per_page: 100,
  }
  let guests = await apiCall('GET /orgs/:org/outside_collaborators', options);

  options.role = "member";
  let members = await apiCall('GET /orgs/:org/members', options);

  options.role = "admin";
  let admins = await apiCall('GET /orgs/:org/members', options);

  fillArrayWithResponse(users, members, {role: "member"});
  fillArrayWithResponse(users, admins, {role: "admin"});
  fillArrayWithResponse(users, guests, {role: "guest"});

  return users;
}

async function loadTeams(options) {
  const orgLogin = options.orgLogin;
  let teams = [];

  options.org = orgLogin;
  options.per_page = 100;

  let response = await apiCall('GET /orgs/:org/teams', options);

  for(let team in response.data){
    let curTeam = response.data[team];
    curTeam.members = [];
    curTeam.subTeams = [];
    curTeam.orgLogin = orgLogin;
    console.error("Found team: " + curTeam.name + " in org " + orgLogin);

    let options = {
      org: orgLogin,
      team_slug: curTeam.slug,
      per_page: 100,
    }

    let teamSubteams = await apiCall('GET /orgs/:org/teams/:team_slug/teams', options);

    options.role = "member";
    let teamMembers = await apiCall('GET /orgs/:org/teams/:team_slug/members', options);

    options.role = "maintainer";
    let teamMaintainers = await apiCall('GET /orgs/:org/teams/:team_slug/members', options);

    fillArrayWithResponse(curTeam.members, teamMembers, {role: "member"});
    fillArrayWithResponse(curTeam.members, teamMaintainers, {role: "maintainer"});
    fillArrayWithResponse(curTeam.subTeams, teamSubteams, {});

    teams.push(curTeam);
  }
  return teams;
}

async function loadRepos(options) {
  const org = options.orgLogin;
  const per_page = 100;

  return await apiCall('GET /orgs/:org/repos', {org, per_page});
}

async function loadRepoCollaborators(options) {
  const owner = options.orgLogin;
  const repo = options.repo;
  const per_page = 100;

  return await apiCall('GET /repos/:owner/:repo/collaborators', {owner, repo, per_page});
}

async function loadRepoTeams(options) {
  const owner = options.orgLogin;
  const repo = options.repo;
  const per_page = 100;

  return await apiCall('GET /repos/:owner/:repo/teams', {owner, repo, per_page});
}

async function loadUserEmails(options) {
  const orgLogin = options.orgLogin;
  const userArray = options.userArray;

  let users = [];
  for(let user in userArray){
    let curUser = userArray[user];

    try {
      let response = await octokit.request('GET /users/:username', {username: curUser.login});

      // attempt to get public email address
      if(response.data.email) {
        console.log("Found public email: " + response.data.email);
        curUser.email = response.data.email;
        users.push(curUser);
        continue;
      }
    } catch (error) {
      console.log("Error getting user email for " + curUser.id + " (" + curUser.login + "): " + error);
    }
  }
  return users;
}

async function fillArrayWithResponse(array, response, customFields){
  for(let item in response.data){
    let curItem = response.data[item];
    if(customFields){
      for(let field in customFields){
        curItem[field] = customFields[field];
      }
    }
    array.push(curItem);
  }
  return array;
}

async function apiCall(url, options){

  const pages = await octokit.paginate(url, options);
  const response = { data: pages };

  return response;
}

const githubIntegration = {
  generateAllPersonas,
}

module.exports = { 
  githubIntegration
};