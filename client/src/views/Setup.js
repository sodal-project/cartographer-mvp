import React, {useState, useEffect} from 'react';
import { faGear } from '@fortawesome/free-solid-svg-icons'
import Headline from '../components/Headline';
import Button from '../components/Button';

export default function Setup({
  setLoading
}) {
  const [purgeFiles, setPurgeFiles] = useState(false);
  const [purgeParticipants, setPurgeParticipants] = useState(false);
  const [purgeButtonLabel, setPurgeButtonLabel] = useState("Purge Integrations");

  useEffect(() => {
    let label = "Purge Integrations"
    if (purgeFiles && purgeParticipants) {
      label = "Purge Integrations, Participants and Files"
    } else if (purgeFiles) {
      label = "Purge Integrations and Files"
    } else if (purgeParticipants) {
      label = "Purge Integrations and Participants"
    }
    setPurgeButtonLabel(label);
  }, [purgeFiles, purgeParticipants])

  const syncPersonas = () => {
    setLoading(true);
    fetch('http://localhost:3001/integrations-sync')
      .then(response => {
        if (!response.ok) {
          setLoading(false);
          throw new Error('Request failed');
        }
        setLoading(false);
        return
      })
      .catch(error => {
        setLoading(false);
        console.error('Sync error', error);
      });
  }
  
  const purgeDatabase = () => {
    const type = purgeFiles && purgeParticipants ? "all" : purgeFiles ? "files" : purgeParticipants ? "participants" : "integrations";
    fetch(`http://localhost:3001/purge-db/${type}`)
      .then(async response => {
        if (!response.ok) {
          throw new Error('Request failed');
        }
        const result = await response.json();
        alert(result);
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
      <h3 className="mt-10 mb-2 font-bold text-white">Purge Data</h3>
      <p className="mb-5 text-gray-300">Remove integrations data from the database.</p>
      <div className="flex items-center mb-4">
        <input type="checkbox" id="participant" name="participant" className="mr-2" onChange={() => { setPurgeParticipants(!purgeParticipants) }} />
        <label className="text-white text-sm select-none" htmlFor="participant">Also remove participant data</label>
      </div>
      <div className="flex items-center mb-7">
        <input type="checkbox" name="cache" id="cache" className="mr-2" onChange={() => { setPurgeFiles(!purgeFiles) }} />
        <label className="text-white text-sm select-none" htmlFor="cache">Also remove cache files</label>
      </div>
      <Button label={purgeButtonLabel} click={purgeDatabase} />
    </div>
  )
}