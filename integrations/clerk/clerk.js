const { Persona } = require('../../utils/persona');
const { cache } = require('../../utils/cache');
const { apiCall } = require('./clerkApiCall')
const mapper = require('./clerkMapper')

const generateAllPersonas = async (integration) => {
  const apiKey = integration.apiKey

  try {
    // Load Data from the Clerk API or cache files if they exist
    const users = await cache.getData('getUserList', `clerk-users`, apiCall, apiKey)

    // Map the API responses to the personas schema in mappers
    const userPersonas = mapper.userPersonas(users)

    // Combine the mapped objects into a single array
    const personas = [...userPersonas]
    return Persona.addToDatabase(personas)
  } catch (error) {
    console.error('Integration stopped due to error:', error);
  }
}

module.exports = {
  clerkIntegration: {
    generateAllPersonas,
  }
}
