import React, {useState, useEffect} from 'react';
import { faGear } from '@fortawesome/free-solid-svg-icons'
import toast from 'react-hot-toast';
import { convertObjectArrayToCSV, downloadCSV } from '../util/util';
import Headline from '../components/Headline';
import Button from '../components/Button';

export default function Setup({
  setIsManualLoading
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
    setIsManualLoading(true);
    fetch(`${process.env.REACT_APP_API_BASE_URL}/integrations-sync`)
      .then(response => {
        if (!response.ok) {
          setIsManualLoading(false);
          throw new Error('Request failed');
        }
        setIsManualLoading(false);
        return
      })
      .catch(error => {
        setIsManualLoading(false);
        console.error('Sync error', error);
      });
  }
  
  const purgeDatabase = () => {
    setIsManualLoading(true);
    const type = purgeFiles && purgeParticipants ? "all" : purgeFiles ? "files" : purgeParticipants ? "participants" : "integrations";
    fetch(`${process.env.REACT_APP_API_BASE_URL}/purge-db/${type}`)
      .then(async response => {
        if (!response.ok) {
          throw new Error('Request failed');
        }
        const result = await response.json();
        setIsManualLoading(false);
        toast.success(result)
        return
      })
      .catch(error => {
        setIsManualLoading(false);
        console.error('Sync error', error);
      });
  }

  const exportParticipants = async () => {
    const requestBody = {
      page: 1,
      pageSize: 500000,
      filterQuery: `[{"type":"filterField","name":"type","operator":"=","value":"participant","id":1}]`
    };

    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/personas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json', // Set the content type to JSON
        },
        body: JSON.stringify(requestBody), // Convert the request body to a string
      });

      if (!response.ok) {
        throw new Error(`HTTP Error! Status: ${response.status}`);
      }

      const body = await response.json();
      const records = body.records;
      if (records?.length > 0){
        const personas = records.map(node => node._fields[0].properties);
        const csv = convertObjectArrayToCSV(personas)
        downloadCSV(csv, "participant-personas.csv")
      }
    } catch (error) {
      console.error(error);
    }
  };
 
  const exportParticipantRelationships = async () => {
    const requestBody = {
      page: 1,
      pageSize: 500000,
    };

    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/persona-relationships`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json', // Set the content type to JSON
        },
        body: JSON.stringify(requestBody), // Convert the request body to a string
      });

      if (!response.ok) {
        throw new Error(`HTTP Error! Status: ${response.status}`);
      }

      const body = await response.json();
      const records = body.records;
      if (records?.length > 0){
        const data = records.map((node) => {
          return {
            controllerUpn: node._fields[0],
            accessLevel: node._fields[1]?.type,
            subordinateUpn: node._fields[2],
          }
        });
        const csv = convertObjectArrayToCSV(data)
        downloadCSV(csv, "participant-relationships.csv")
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="bg-gray-900 p-10 px-8">
      <Headline icon={faGear}>Setup</Headline>
      <h3 className="mt-10 mb-2 font-bold text-white">Integrations</h3>
      <p className="mb-6 text-gray-300">Fetch data from various APIs and store as personas in the database.</p>
      <Button label="Run Integrations" click={syncPersonas} />
      <h3 className="mt-10 mb-2 font-bold text-white">Export Data</h3>
      <p className="mb-6 text-gray-300">Download participants or the relationships they have.</p>
      <div className='flex gap-4'>
        <Button label="Download Participant Personas" click={exportParticipants} />
        <Button label="Download Participant Relationships" click={exportParticipantRelationships} />
      </div>
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