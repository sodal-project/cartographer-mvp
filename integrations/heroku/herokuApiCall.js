/*
  API CALL
  This function is used to make API calls to Heroku. It takes
  an endpoint and an API key as arguments.
*/

const apiCall = async (endpoint, apiKey) => {
  const response = await fetch(endpoint, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Accept': 'application/vnd.heroku+json; version=3',
    },
  });

  if (response.status === 200) {
    return response.json();
  } else {
    throw new Error(`Error: ${response.status} - ${response.statusText}`);
  }
}

module.exports = {
  apiCall
}
