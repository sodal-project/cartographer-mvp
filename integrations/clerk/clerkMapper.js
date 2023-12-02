/*
  MAPPERS
  Each function in this file takes an api response and maps it to
  the personas schema passed to the Persona.addToDatabase function which adds
  data to the database.
*/

const accessLevelMap = {
  'admin': 'admin',
  'superadmin': 'superadmin',
  'collaborator': 'user',
  'member': 'user',
  'owner': 'user',
}

const userPersonas = (response) => {
  const personas = response.map(item => {
    const emailAccounts = item.emailAddresses?.map(item => ({
      accessLevel: 'superadmin',
      upn: `upn:email:account:${item.emailAddress}`,
    }))
    const githubAccounts = item.externalAccounts?.filter(item => item.provider === 'oauth_github').map(item => ({
      accessLevel: 'superadmin',
      upn: `upn:github:account:${item.username}`,
    }))

    return ({
      standardProps: {
        id: item.id,
        status: "active",
        platform: "clerk",
        type: "account",
        friendlyName: `${item.firstName} ${item.lastName}`,
      },
      customProps: {
        firstName: item.firstName,
        lastName: item.lastName,
      },
      emails: item.emailAddresses.map(item => (item.emailAddress)),
      controls: [...emailAccounts, ...githubAccounts],
    })
  })
  return personas
}

const githubPersonas = (response) => {
  const personas = response.map(item => {
    return ({
      standardProps: {
        id: item.username,
        status: "active",
        platform: "github",
        type: "account",
        friendlyName: `${item.username}`,
      },
      obeys: [
        {
          accessLevel: 'admin',
          upn: `upn:email:account:${item.emailAddress}`,
        }
      ]
    })
  })
  return personas
}

module.exports = {
  userPersonas,
  githubPersonas
};
