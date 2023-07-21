import React from 'react';
import { faGear } from '@fortawesome/free-solid-svg-icons'
import Headline from '../components/Headline';
import Button from '../components/Button';

export default function Setup() {
  const syncPersonas = () => {
    fetch('http://localhost:3001/integrations/sync')
      .then(response => {
        if (!response.ok) {
          throw new Error('Request failed');
        }
        console.log('sync complete');
        alert('Sync complete');
        return
      })
      .catch(error => {
        console.error('Sync error', error);
      });
  }
  
  const purgeDatabase = () => {
    fetch('http://localhost:3001/purge-db')
      .then(response => {
        if (!response.ok) {
          throw new Error('Request failed');
        }
        console.log('purge complete');
        alert('Database has been purged');
        return
      })
      .catch(error => {
        console.error('Sync error', error);
      });
  }
  
  return (
    <div className="bg-gray-900 p-10">
      <Headline icon={faGear}>Setup</Headline>
      <h3 className="mt-10 mb-2 font-bold text-white">Integrations</h3>
      <p className="mb-6 text-gray-300">Fetch data from various APIs and store as personas in the database.</p>
      <Button label="Run Integrations" click={syncPersonas} />
      <h3 className="mt-10 mb-2 font-bold text-white">Purge Database</h3>
      <p className="mb-6 text-gray-300">Remove all data from the database.</p>
      <Button label="Purge Database" click={purgeDatabase} />
    </div>
  )
}