const { Persona } = require('../../utils/persona');
const { cache } = require('../../utils/cache');
const { apiCall } = require('./herokuApiCall')
const mapper = require('./herokuMapper')

const generateAllPersonas = async (integration) => {
  const apiKey = integration.apiKey

  try {
    // Load Data from the Heroku API or cache files if they exist
    const teams = await cache.getData('https://api.heroku.com/teams', `heroku-teams`, apiCall, apiKey)

    const members = []
    for (let team of teams) {
      const endpoint = `https://api.heroku.com/teams/${team.id}/members`
      const cacheName = `heroku-members-${team.name}`
      const teamMembers = await cache.getData(endpoint, cacheName, apiCall, apiKey)
      const teamMembersWithTeamId = teamMembers.map(member => { return { ...member, teamId: team.id } })
      members.push(...teamMembersWithTeamId)
    }

    const apps = []
    for (let team of teams) {
      const endpoint = `https://api.heroku.com/teams/${team.id}/apps`
      const cacheName = `heroku-apps-${team.name}`
      const teamApps = await cache.getData(endpoint, cacheName, apiCall, apiKey)
      apps.push(...teamApps)
    }
    
    const collaborators = []
    for (let app of apps) {
      const endpoint = `https://api.heroku.com/apps/${app.name}/collaborators`
      const cacheName = `heroku-collaborators-${app.name}`
      const appCollaborators = await cache.getData(endpoint, cacheName, apiCall, apiKey)
      const appCollaboratorsWithAppName = appCollaborators.map(app => { return { ...app, appName: app.name } })
      collaborators.push(...appCollaboratorsWithAppName)
    }

    // Map the API responses to the personas schema in mappers
    const teamPersonas = mapper.teamPersonas(teams)
    const memberPersonas = mapper.memberPersonas(members)
    const appPersonas = mapper.appPersonas(apps)
    const collaboratorPersonas = mapper.collaboratorPersonas(collaborators)

    // Combine the mapped objects into a single array
    const personas = [...teamPersonas, ...memberPersonas, ...appPersonas, ...collaboratorPersonas]
    return Persona.addToDatabase(personas)
  } catch (error) {
    console.error('Integration stopped due to error:', error);
  }
}

module.exports = {
  herokuIntegration: {
    generateAllPersonas,
  }
}
