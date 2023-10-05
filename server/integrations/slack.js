const {WebClient} = require('@slack/web-api');
const {Persona} = require('../utils/persona');
const {cache} = require('../utils/cache');
const { request } = require('express');

async function generateAllPersonas(slackAuthInstance){
  try {
    const options = {
      teamid: slackAuthInstance.teamId,
      slackClient: new WebClient(slackAuthInstance.token),
    }

    //
    // team (Slack workspace)
    //
    const teamPersona = await generateTeamPersona(options);
    console.log(`Processing ${teamPersona.friendlyName}`);

    options.teamupn = teamPersona.upn;

    // 
    // users
    // 
    console.log(`Processing users for ${teamPersona.friendlyName}`)
    const userPersonas = await generateUserPersonas(options);

    //
    // channels
    // 
    console.log(`Processing channels for ${teamPersona.friendlyName}`)
    const channelPersonas = await generateChannelPersonas(options);

    // 
    // usergroups
    //
    console.log(`Processing usergroups for ${teamPersona.friendlyName}`)
    const groupPersonas = await generateUsergroupPersonas(options);

    return Persona.localStore;
  } catch(e) {
    console.log(e);
  }
}

const generateTeamPersona = async (options) => {

  const team = await loadCached(loadTeam, options);
  return await createPersonaFromTeam(team);
}

const createPersonaFromTeam = async (team) => {
  const standardProps = {
    id: team.id,
    status: "active",
    platform: "slack",
    type: "team",
    friendlyName: `${team.name}`,
  }
  const customProps = {
    name: team.name,
    domain: team.domain,
    emailDomain: team.email_domain,
    isVerified: team.is_verified,
    teamUrl: team.url,
    publicUrl: team.public_url
  }
  return Persona.create(standardProps, customProps);
}

const generateUserPersonas = async (options) => {

  const users = await loadCached(loadUsers, options);
  const teamupn = options.teamupn;
  const userPersonas = [];

  for(const user of users) {
    const userPersona = await createPersonaFromUser(user, options);
    if(userPersona) { userPersonas.push(userPersona) };
  }
  return userPersonas;
}

const createPersonaFromUser = async (user, options) => {

  const handle = user.profile.display_name || user.profile.real_name || user.name;

  let accessLevel;
  if(user.is_owner){
    accessLevel = "superadmin";
  } else if(user.is_admin){
    accessLevel = "admin";
  } else if(user.is_restricted || user.is_ultra_restricted){
    accessLevel = "guest";
  } else {
    accessLevel = "user";
  }

  const standardProps = {
    id: user.id,
    status: user.deleted ? "suspended" : "active",
    platform: "slack",
    type: "account",
    friendlyName: `${handle}`,
  }
  const customProps = {
    handle: handle,
    name: user.name,
    realName: user.profile.real_name,
    displayName: user.profile.display_name,
    team: user.team_id,
    accountType: user.is_bot ? "bot" : "user",
  }
  const userPersona = Persona.create(standardProps, customProps);

  const teamupn = "upn:slack:team:" + user.team_id;

  // if we don't have canonical data for this team, try to get it
  if(!Persona.localStore[teamupn] || !Persona.localStore[teamupn].metadata.canonical){
    options.selection = user.team_id;
    const team = await loadCached(loadTeam, options);
    await createPersonaFromTeam(team);
  }

  Persona.addController(teamupn, userPersona.upn, accessLevel, 1);
  Persona.addController(userPersona.upn, teamupn, "system");

  const email = user.profile.email;
  if(email){
    const emailPersona = Persona.addPersonaEmailAccount(email);
    Persona.addController(userPersona.upn, emailPersona.upn, "superadmin", 1);
  }

  return userPersona;
}

const generateChannelPersonas = async (options) => {
  const channels = await loadCached(loadChannels, options);
  const teamupn = options.teamupn;
  const channelPersonas = [];
  const foundUsers = {};

  for(const channel of channels) {
    const visibility = channel.is_private ? "private" : "public";
    const connect = channel.is_shared ? "shared" : "unshared";

    const standardProps = {
      id: channel.id,
      status: "active",
      platform: "slack",
      type: "channel",
      friendlyName: `${channel.name}`,
    }
    const customProps = {
      name: channel.name,
      visibility: visibility,
      connect: connect,
      topic: channel.topic.value,
      purpose: channel.purpose.value,
    }
    const channelPersona = Persona.create(standardProps, customProps);

    options.selection = channel.id;
    const members = await loadCached(loadChannelMembers, options);

    for(const member of members) {
      const memberupn = "upn:slack:account:" + member;
      foundUsers[memberupn] = member;
      Persona.addController(channelPersona.upn, memberupn, "user");
    }

    // process unique found users at once
    for(const memberupn in foundUsers){
      // if we don't have canonical data for this user, try to get it
      if(!Persona.localStore[memberupn].metadata.canonical){
        options.selection = foundUsers[memberupn];
        const user = await loadCached(loadUser, options);
        await createPersonaFromUser(user, options);
      }
    }

    Persona.addController(channelPersona.upn, teamupn, "system");

    channelPersonas.push(channelPersona);
  }
  return channelPersonas;
}

const generateUsergroupPersonas = async (options) => {
  options.selection = null;

  const groups = await loadCached(loadUsergroups, options);
  const teamupn = options.teamupn;
  const groupPersonas = [];

  for(const group of groups) {
    const standardProps = {
      id: group.id,
      status: "active",
      platform: "slack",
      type: "group",
      friendlyName: `${group.name} (@${group.handle})`,
    }
    const customProps = {
      name: group.name,
      description: group.description,
      handle: group.handle,
    }
    const groupPersona = Persona.create(standardProps, customProps);

    const members = group.users;
    const allChannels = group.prefs.channels.concat(group.prefs.groups);

    for(const member of members) {
      const memberupn = "upn:slack:account:" + member;

      // if we don't have canonical data for this user, try to get it
      if(!Persona.localStore[memberupn] || !Persona.localStore[memberupn].metadata.canonical){
        options.selection = member;
        const user = await loadCached(loadUser, options);
        await createPersonaFromUser(user, options);
      }

      Persona.addController(groupPersona.upn, memberupn, "user", 1);
    }

    for(const channel of allChannels) {
      const channelupn = "upn:slack:channel:" + channel;
      Persona.addController(channelupn, groupPersona.upn, "user", 1)
    }

    Persona.addController(groupPersona.upn, teamupn, "system");

    groupPersonas.push(groupPersona);
  }

  return groupPersonas;
}

const loadCached = async (func, options) => {
  teamid = options.teamid;

  let cacheName = 'slack-' + teamid + "-" + func.name;
  if(options.selection) {
    cacheName += "-" + options.selection;
  }

  const cacheElements = await cache.load(cacheName);
  let elements = [];
  
  if(cacheElements){
    elements = cacheElements;
  } else {
    elements = await func(options);
    await cache.save(cacheName, elements);
  }
  return elements;
}

const loadTeam = async (options) => {
  const slackClient = options.slackClient;

  const requestOptions = {};

  if(options.selection && options.selection != options.teamid){
    requestOptions.team = options.selection;
  }

  const response = await slackClient.team.info(requestOptions);
  if(!response.ok){
    throw new Error("Error loading team info from Slack API");
  }
  return response.team;
}

const loadUser = async (options) => {
  const slackClient = options.slackClient;

  const response = await slackClient.users.info({user: options.selection});
  if(!response.ok){
    throw new Error(`Error loading user ${options.selection} info from Slack API`);
  }
  return response.user;
}

const loadUsers = async (options) => {
  const slackClient = options.slackClient;

  let cursor = "";
  let users = [];
  const requestOptions = {
    // deleted: false,
    limit: 500,
  }
  
  do {
    const response = await slackClient.users.list(requestOptions);
    if(!response.ok){
      throw new Error("Error loading users from Slack API");
    }
    cursor = response.response_metadata ? response.response_metadata.next_cursor : "";
    requestOptions.cursor = cursor;
    users = users.concat(response.members)
  } while (cursor != "");

  return users;
}

const loadChannels = async (options) => {
  const slackClient = options.slackClient;

  let cursor = "";
  let conversations = [];
  const requestOptions = {
    deleted: false,
    limit: 500,
    types: "public_channel,private_channel",
    exclude_archived: true,
  }
  
  do {
    const response = await slackClient.conversations.list(requestOptions);
    if(!response.ok){
      throw new Error("Error loading conversations from Slack API");
    }
    cursor = response.response_metadata ? response.response_metadata.next_cursor : "";
    requestOptions.cursor = cursor;
    conversations = conversations.concat(response.channels)
  } while (cursor != "");

  return conversations;
}

const loadChannelMembers = async (options) => {
  const slackClient = options.slackClient;

  let cursor = "";
  let members = [];
  const requestOptions = {
    limit: 500,
    channel: options.selection,
  }
  
  do {
    const response = await slackClient.conversations.members(requestOptions);
    if(!response.ok){
      throw new Error(`Error loading members for ${options.selection} from Slack API`);
    }
    cursor = response.response_metadata ? response.response_metadata.next_cursor : "";
    requestOptions.cursor = cursor;
    members = members.concat(response.members)
  } while (cursor != "");

  return members;
}

const loadUsergroups = async (options) => {
  const slackClient = options.slackClient;

  let cursor = "";
  let usergroups = [];
  const requestOptions = {
    limit: 500,
    include_users: true,
    include_disabled: false,
  }
  
  const response = await slackClient.usergroups.list(requestOptions);

  return response.usergroups;
}

const slackIntegration = {
  generateAllPersonas,
}

module.exports = {
  slackIntegration,
}