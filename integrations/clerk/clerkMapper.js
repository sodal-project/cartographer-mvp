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
    return ({
      standardProps: {
        id: item.id,
        status: "active",
        platform: "clerk",
        type: "user",
        friendlyName: `${item.firstName} ${item.lastName}`,
      },
      // customProps: {
      //   name: item.user?.name || item.email,
      //   authenticationMin: item.two_factor_authentication ? 2 : 1,
      // },
      // email: item.emailAddresses,
      // controls: [
      //   {
      //     accessLevel: accessLevelMap[item.role?.toLowerCase().replace(' ', '')],
      //     upn: `upn:heroku:team:${item.teamId}`,
      //   },
      // ],
      // obeys: [
      //   {
      //     accessLevel: accessLevelMap[item.role?.toLowerCase().replace(' ', '')],
      //     upn: `upn:email:account:${item.email}`,
      //   }
      // ]
    })
  })
  return personas
}

module.exports = {
  userPersonas
};
