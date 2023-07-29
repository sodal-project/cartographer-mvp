require('dotenv').config();

const {Octokit} = require('@octokit/rest');
const {Persona} = require('../utils/persona');
const {cache} = require('../utils/cache');
const { request } = require('express');

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

// TODO: pass in auth token as parameter
async function generateAllPersonas(authInstance) {
  try {
    const startCount = Object.keys(Persona.localStore).length;
    console.log("Processing Github Orgs");

    const orgs = await loadCached(loadOrgs);
    generateOrgPersonas(orgs);

    console.log("Processing Github Users and Teams");
    for(let org in orgs){
      let curOrg = orgs[org];
      let orgLogin = curOrg.login;
      let orgUPN = Persona.generateUPNraw(
        Persona.Platform.Github,
        Persona.Type.Organization,
        curOrg.id,
      )
      console.log("Processing users for " + curOrg.login + " (" + orgUPN + ")");
      
      try {

        // process users (without email)
        const users = await loadCached(loadUsers, orgLogin);
        generateUserPersonas(users, orgUPN);
        
        // process users (with email)
        const usersWithEmail = await loadCached(loadUserEmails, orgLogin, users);
        generateUserPersonas(usersWithEmail, orgUPN);

        // process teams
        const teams = await loadCached(loadTeams, orgLogin);
        generateTeamPersonas(teams, orgUPN);
      } catch(e){
        console.log(e);
      }
    }
  
    // calculate added items and cache output
    const loadCount = Object.keys(Persona.localStore).length - startCount;
    console.log("loaded " + loadCount + " personas associated with Github");

    await cache.save("allPersonas", Persona.localStore);

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
      status: Persona.Status.Active,
      platform: Persona.Platform.Github,
      type: Persona.Type.Organization,
      friendlyName: `Github Organization: ${org.login}`,
    }
    const customProps = {
      login: org.login.toLowerCase(),
      githubName: org.name,
      githubDescription: org.description,
    }
    const persona = Persona.create(standardProps, customProps);
    
    // Create Alias Object
    const aliasId = org.login.toLowerCase();
    const personaAlias = Persona.createAlias(aliasId, standardProps);
    const connectedPersona = Persona.connectAliasObjects(persona, personaAlias);
    
    // Store Objects
    Persona.updateStore(personaAlias);
    Persona.updateStore(connectedPersona);
  }
}

function generateUserPersonas(users, orgUPN) {
  for(let user in users){
    let curUser = users[user];

    // Create Github User Persona Object
    const standardProps = {
      id: curUser.id,
      status: Persona.Status.Active,
      platform: Persona.Platform.Github,
      type: Persona.Type.Account,
      friendlyName: `Github Account: ${curUser.id} (${curUser.login})`
    }
    const persona = Persona.create(standardProps);

    // Add Alias
    const aliasId = curUser.login.toLowerCase();
    const personaAlias = Persona.createAlias(aliasId, standardProps);
    const connectedPersona = Persona.connectAliasObjects(persona, personaAlias);
    
    // Store Persona and Persona Alias
    Persona.updateStore(personaAlias);
    Persona.updateStore(connectedPersona);

    // BELOW HERE NEEDS REFACTORING
    // ---------------------------------------------
    // add email member if applicable (omit Github noreply emails)
    if(curUser.email && !curUser.email.includes("noreply.github.com")){
      let memberPersonaUPN = Persona.addPersonaEmailAccount(curUser.email)[Persona.Properties.UPN];
      Persona.addMember(persona[Persona.Properties.UPN], memberPersonaUPN, Persona.Relationship.Members.AccessLevel.SuperAdmin);
    }

    // add as member of org persona
    if(orgUPN){
      let accessLevel;
      switch (curUser.role) {
        case "admin":
          accessLevel = Persona.Relationship.Members.AccessLevel.SuperAdmin;
          break;
        case "member":
          accessLevel = Persona.Relationship.Members.AccessLevel.User;
          break;
        case "guest":
          accessLevel = Persona.Relationship.Members.AccessLevel.Guest;
          break;
      }
      if(!accessLevel){
        console.log("No access level found for Github user " + curUser.login + " in org " + orgUPN + ")");
      } else {
        Persona.addMember(orgUPN, persona[Persona.Properties.UPN], accessLevel);
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
      status: Persona.Status.Active,
      platform: Persona.Platform.Github,
      type: Persona.Type.Team,
      friendlyName: `Github Team: ${curTeam.slug}@${orgPersona.login} (${curTeam.id})`
    }
    const customProps = {
      privacy: curTeam.privacy,
      permission: curTeam.permission,
    }
    const persona = Persona.create(standardProps, customProps);
    
    // Add Alias
    const aliasId = `${curTeam.slug}@${orgPersona.login}`.toLowerCase()
    const personaAlias = Persona.createAlias(aliasId, standardProps, customProps)
    const connectedPersona = Persona.connectAliasObjects(persona, personaAlias)
    
    Persona.updateStore(personaAlias);
    Persona.updateStore(connectedPersona);
    
    // BELOW HERE NEEDS REFACTORING
    // ---------------------------------------------
    const upn = persona[Persona.Properties.UPN];

    // add as member of org persona
    Persona.addMember(orgUPN, upn, Persona.Relationship.Members.AccessLevel.Indirect);

    // add members
    if(curTeam.members){
      curTeam.members.forEach(member => {
        let accessLevel = Persona.Relationship.Members.AccessLevel.User;
        if(member.role === "maintainer"){
          accessLevel = Persona.Relationship.Members.AccessLevel.SuperAdmin;
        }
        const memberPersonaUPN = Persona.generateUPNraw("github", "account", member.id);
        Persona.addMember(upn, memberPersonaUPN, accessLevel);
      });
    }

    // add subTeams
    if(curTeam.subTeams){
      // console.log("found " + curTeam.subTeams + " for " + slug);
      let teamAccessLevel = Persona.Relationship.Members.AccessLevel.User;
      curTeam.subTeams.forEach(subteam => {
        const subteamPersonaUPN = Persona.generateUPNraw("github", "team", subteam.id);
        Persona.addMember(upn, subteamPersonaUPN, teamAccessLevel);
      });
    }

    // store and return persona
    Persona.updateStore(persona);
  }
}

async function loadCached(func, orgLogin, userArray){
  if(!orgLogin){ orgLogin = "";} 
  const cacheName = 'github-' + orgLogin + "-" + func.name;
  const cacheElements = await cache.load(cacheName);
  let elements = [];
  if(cacheElements){
    console.error("Found cache " + cacheName);
    elements = cacheElements;
  } else {
    console.error("No cache found for " + cacheName + ", attempting to load...");
    elements = await func(orgLogin, userArray);
    await cache.save(cacheName, elements);
  }
  return elements;
}

async function loadOrgs() {
  let orgs = [];
  let response = await requestUserOrgs();
  for(let org in response.data){
    let curOrg = response.data[org];
    let orgRequest = await requestOrgDetails(curOrg.login);
    let orgDetails = orgRequest.data;
    console.error("Found org: " + orgDetails.login);
    orgs.push(orgDetails);
  }
  return orgs;
}

async function loadUsers(orgLogin) {
  let users = [];

  fillArrayWithResponse(users, await requestOrgMembers(orgLogin), {role: "member"});
  fillArrayWithResponse(users, await requestOrgAdmins(orgLogin), {role: "admin"});
  fillArrayWithResponse(users, await requestOrgGuests(orgLogin), {role: "guest"});

  return users;
}

async function loadTeams(orgLogin) {
  let teams = [];
  let response = await requestOrgTeams(orgLogin);
  for(let team in response.data){
    let curTeam = response.data[team];
    curTeam.members = [];
    curTeam.subTeams = [];
    curTeam.orgLogin = orgLogin;
    console.error("Found team: " + curTeam.name + " in org " + orgLogin);

    fillArrayWithResponse(curTeam.members, await requestTeamMembers(orgLogin, curTeam.slug), {role: "member"});
    fillArrayWithResponse(curTeam.members, await requestTeamMaintainers(orgLogin, curTeam.slug), {role: "maintainer"});
    fillArrayWithResponse(curTeam.subTeams, await requestTeamSubteams(orgLogin, curTeam.slug));

    teams.push(curTeam);
  }
  return teams;
}

async function loadUserEmails(orgLogin, userArray) {
  let users = [];
  for(let user in userArray){
    let curUser = userArray[user];

    try {
      // attempt to get public email address
      let response = await requestUserDetails(curUser.login);

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

async function requestUserDetails(login){
  let url = 'GET /users/{username}';
  let options = {
    username: login,
  }
  return await apiCall(url, options);
}

async function requestUserOrgs(){
  let url = 'GET /user/orgs';
  let options = {}
  return await apiCall(url, options);
}

async function requestOrgDetails(orgLogin){
  let url = 'GET /orgs/{org}';
  let options = {
    org: orgLogin,
  }
  return await apiCall(url, options);
}

async function requestOrgTeams(orgLogin){
  let url = 'GET /orgs/{org}/teams';
  let options = {
    org: orgLogin,
    per_page: 100,
  }
  return await apiCall(url, options);
}

async function requestOrgMembers(orgLogin){
  let url = 'GET /orgs/{org}/members';
  let options = {
    org: orgLogin,
    per_page: 100,
    role: "member",
  }
  return await apiCall(url, options);
}

async function requestOrgAdmins(orgLogin){
  let url = 'GET /orgs/{org}/members';
  let options = {
    org: orgLogin,
    per_page: 100,
    role: "admin",
  }
  return await apiCall(url, options);
}

async function requestOrgGuests(orgLogin){
  let url = 'GET /orgs/{org}/outside_collaborators';
  let options = {
    org: orgLogin,
    per_page: 100,
  }
  return await apiCall(url, options);
}

async function requestTeamMembers(orgLogin, teamSlug){
  let url = 'GET /orgs/{org}/teams/{team_slug}/members';
  let options = {
    org: orgLogin,
    team_slug: teamSlug,
    per_page: 100,
  }
  return await apiCall(url, options);
}

async function requestTeamMaintainers(orgLogin, teamSlug){
  let url = 'GET /orgs/{org}/teams/{team_slug}/members';
  let options = {
    org: orgLogin,
    team_slug: teamSlug,
    per_page: 100,
  }
  return await apiCall(url, options);
}

async function requestTeamSubteams(orgLogin, teamSlug){
  let url = 'GET /orgs/{org}/teams/{team_slug}/teams';
  let options = {
    org: orgLogin,
    team_slug: teamSlug,
    per_page: 100,
  }
  return await apiCall(url, options);
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

// TODO: remove octokit dependency
async function apiCall(url, options){

  let response = await octokit.request(url, options);
  return response;
}

const githubIntegration = {
  generateAllPersonas,
}

module.exports = { 
  githubIntegration
};