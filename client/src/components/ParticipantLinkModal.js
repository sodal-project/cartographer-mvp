import React, { useState, useEffect } from 'react';
import {faPlus} from '@fortawesome/free-solid-svg-icons'
import ParticipantList from './ParticipantList';
import ParticipantAdd from './ParticipantAdd';
import Detail from './Detail';
import Button from './Button'

export default function ParticipantLinkModal({
  currentPersona
}) {
  const [participants, setParticipants] = useState([]);
  const [currentParticipant, setCurrentParticipant] = useState(null);
  const [showAddParticipant, setShowAddParticipant] = useState(false);

  // Load Participants
  const fetchData = async (filters) => {
    try {
      const response = await fetch(`http://localhost:3001/personas?filterQuery=[{"type":"filterField","name":"type","operator":"=","value":"participant","id":1}]`)
      const nodes = await response.json();
      if (nodes?.length > 0){
        const loadedParticipants = nodes.map(node => node.properties);
        setParticipants(loadedParticipants);
      } else {
        setParticipants([])
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onLinkParticipant = async () => {
    console.log('Persona UPN: ', currentPersona.upn)
    console.log('Participant UPN: ', currentParticipant.upn)

    const requestData = {
      personaUpn: currentPersona.upn,
      participantUpn: currentParticipant.upn,
    };

    try {
      const response = await fetch('http://localhost:3001/persona-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      });
      console.log(response)
      
      if (response.ok) {
        console.log('success')
      } else {
        console.log('error')
      }
    } catch (error) {
      console.error(error);
    }
  }

  const onParticipantNameClick = (item) => {
    setCurrentParticipant(item)
  }

  const toggleParticipantForm = () => {
    setShowAddParticipant(!showAddParticipant)
  }
  
  const handleParticipantAdded = () => {
    fetchData()
    setShowAddParticipant(!showAddParticipant)
  }
    
  return (
    <div className="relative flex bg-gray-900 rounded-lg border border-gray-700 h-full">

      <div className="flex flex-col flex-none w-72 border-r border-gray-700">
        <div className="p-4 pb-0">
          <h3 className="text-gray-400 text-sm">
            Link a participant to<br />
            <span className="text-white">{currentPersona.friendlyName}</span>
          </h3>
        </div>
        <div className="relative flex-1">
          <ParticipantList participants={participants} onParticipantNameClick={onParticipantNameClick} />
        </div>
        <div className="border-t border-gray-700 p-4">
          <Button label="Add Participant" icon={faPlus} type="link" click={toggleParticipantForm} />
          {showAddParticipant && (
            <ParticipantAdd onCancel={toggleParticipantForm} onSuccess={handleParticipantAdded} />
          )}
        </div>
      </div>

      <div className="flex-1">
        {currentParticipant && (
          <Detail persona={currentParticipant} onLinkParticipant={onLinkParticipant} />
        )}
      </div>
    </div>
  )
}