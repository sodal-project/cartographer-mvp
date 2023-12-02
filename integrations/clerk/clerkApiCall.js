/*
  API CALL
  This function is used to make API calls to Clerk. It takes
  an endpoint and an API key as arguments.
*/

const { Clerk } = require('@clerk/backend');

const apiCall = async (endpoint, apiKey) => {
  const clerk = Clerk({ secretKey: apiKey });
  const response = await clerk.users[endpoint]();
  if (response) {
    return response;
  } else {
    throw new Error(`Error: Clerk API call failed when calling ${endpoint}`);
  }
}

module.exports = {
  apiCall
}
