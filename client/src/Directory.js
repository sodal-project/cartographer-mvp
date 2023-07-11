import React, { useState, useEffect } from 'react';
import Table from './Table';

export default function Directory() {
  const [personas, setPersonas] = useState([]);
  const [personaCount, setPersonaCount] = useState(0);

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const response = await fetch('http://localhost:3001/persona-count');
        const count = await response.json();
        setPersonaCount(count);
      } catch (error) {
        console.error(error);
      }
    };

    fetchCount();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:3001/personas?page=1&pageSize=100');
        const nodes = await response.json();
        const personas = nodes.map(node => node.properties);
        setPersonas(personas);
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, []);

  const syncPersonas = () => {
    fetch('http://localhost:3001/integrations/sync')
      .then(response => {
        if (!response.ok) {
          throw new Error('Request failed');
        }
        console.log('sync complete');
        return
      })
      .catch(error => {
        console.error('Sync error', error);
      });
  }

  return (
    <div className="bg-gray-900 p-10">
      <div className="sm:flex sm:items-center mb-10">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold leading-6 text-white">Directory</h1>
          <p className="mt-2 text-sm text-gray-300">
            Found {personaCount} personas in the database.
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <button
            onClick={syncPersonas}
            type="button"
            className="block rounded-md bg-indigo-500 px-3 py-2 text-center text-sm font-semibold text-white hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
          >
            Sync
          </button>
        </div>
      </div>
      <Table data={personas} />
    </div>
  )
}