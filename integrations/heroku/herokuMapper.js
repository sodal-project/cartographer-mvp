/*
  MAPPERS
  Each function in this file takes an api response and maps it to
  the personas schema passed to the Persona.addToDatabase function which adds
  data to the database.
*/

const accessLevelMap = {
  'herokuAdmin': 'admin',
}

const teamPersonas = (response) => {
  const personas = response.map(item => {
    return ({
      standardProps: {
        id: item.id,
        status: "active",
        platform: "heroku",
        type: "team",
        friendlyName: item.name,
      },
      customProps: {
        name: item.name,
        role: item.role,
        accountType: item.type,
        identityProvider: item.identity_provider,
        membershipLimit: item.membership_limit,
      }
    })
  })
  return personas
}

const memberPersonas = (response) => {
  const personas = response.map(item => {
    return ({
      standardProps: {
        id: item.id,
        status: "active",
        platform: "heroku",
        type: "account",
        friendlyName: item.user?.name || item.email,
      },
      customProps: {
        name: item.user?.name || item.email,
        authenticationMin: item.two_factor_authentication ? 2 : 1,
      },
      email: item.email,
      controls: [
        {
          accessLevel: accessLevelMap[item.role],
          upn: `upn:heroku:team:${item.teamId}`,
        },
      ],
      obeys: [
        {
          accessLevel: accessLevelMap[item.role],
          upn: `upn:email:account:${item.email}`,
        }
      ]
    })
  })
  return personas
}

const appPersonas = (response) => {
  const personas = response.map(item => {
    return ({
      standardProps: {
        id: item.id,
        status: "active",
        platform: "heroku",
        type: "app",
        friendlyName: item.name,
      },
      customProps: {
        name: item.name,
        region: item.region?.name,
        webUrl: item.web_url,
        gitUrl: item.git_url,
      },
      email: item.owner?.email,
      obeys: [
        {
          accessLevel: 'admin',
          upn: `upn:heroku:team:${item.team?.id}`,
        },
        {
          accessLevel: 'superadmin',
          upn: `upn:email:account:${item.owner?.email}`,
        }
      ]
    })
  })
  return personas
}

const collaboratorPersonas = (response) => {
  const personas = response.map(item => {
    return ({
      standardProps: {
        id: item.id,
        status: "active",
        platform: "heroku",
        type: "collaborator",
        friendlyName: item.user.email,
        name: item.user?.email,
      },
      customProps: {
        name: item.user?.email,
      },
      email: item.user?.email,
      controls: [
        {
          accessLevel: accessLevelMap[item.role],
          upn: `upn:email:account:${item.user?.email}`,
        },
      ]
    })
  })
  return personas
}

module.exports = {
  teamPersonas,
  memberPersonas,
  appPersonas,
  collaboratorPersonas
};
