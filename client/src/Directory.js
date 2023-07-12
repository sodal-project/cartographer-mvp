import React, { useState, useEffect } from 'react';
import Table from './Table';
import Pagination from './Pagination';
import Button from './Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAddressBook } from '@fortawesome/free-regular-svg-icons'

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
    <div className="bg-gray-900">
      <div className="p-10 ">
        <div className="flex items-center mb-10">
          <div className="flex flex-1">
            <div className='text-white mr-3'>
              <FontAwesomeIcon icon={faAddressBook} size="xl" />
            </div>
            <h1 className="text-2xl font-semibold leading-6 text-white">Directory</h1>
          </div>
          <div className="flex-none">
            <Button label="Sync" click={syncPersonas} />
          </div>
        </div>
        <Table data={personas} />
      </div>
      <div className="sticky bottom-0 text-white py-6 px-10 bg-gray-900 border-t border-gray-700">
        <Pagination itemCount={personaCount} />
      </div>
    </div>
  )
}