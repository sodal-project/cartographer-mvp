import React, { useEffect, useState } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

import RootLayout from './views/Root';
import ErrorPage from './views/Error';
import Directory from './views/Directory';
import Integrations from './views/Integrations';
import Setup from './views/Setup';

async function directoryLoader({ request }, filters = []) {
  const url = new URL(request.url);
  const requestBody = {
    page: url.searchParams.get("page") || 1,
    pageSize: url.searchParams.get("pageSize") || 50,
    orderBy: url.searchParams.get("orderBy") || "friendlyName",
    orderByDirection: url.searchParams.get("orderByDirection") || "ASC",
    filterQuery: JSON.stringify(filters)
  };

  try {
    const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/personas`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json', // Set the content type to JSON
      },
      body: JSON.stringify(requestBody), // Convert the request body to JSON
    });

    if (!response.ok) {
      throw new Error(`HTTP Error! Status: ${response.status}`);
    } else {
      const responseData = await response.json();
      return {
        personas: responseData?.records?.map(node => node._fields[0].properties) || [],
        personaCount: responseData?.total || 0,
        page: requestBody.page,
        pageSize: requestBody.pageSize,
      };
    }
  } catch (error) {
    console.error(error);
  }
}

function App() {
  const [setup, setSetup] = useState(false);
  const [filters, setFilters] = useState("these are filters");
  const [isManualLoading, setIsManualLoading] = useState(false);

  const router = createBrowserRouter([
    {
      path: '/',
      element: <RootLayout isManualLoading={isManualLoading} />,
      errorElement: <ErrorPage />,
      children: [
        { path: '', element: <Directory setFilters={setFilters} />, loader: (request) => directoryLoader(request, filters) },
        { path: 'integrations', element: <Integrations /> },
        { path: 'setup', element: <Setup setIsManualLoading={setIsManualLoading} /> },
      ]
    },
  ])

  useEffect(() => {
    const setupFolders = async () => {
      try {
        await fetch(`${process.env.REACT_APP_API_BASE_URL}/setup-folders`);
        setSetup(true);
      } catch (error) {
        console.error(error);
      }
    };
    if (!setup) {
      setupFolders(true);
    }
  });

  return <RouterProvider router={router} />
}

export default App;