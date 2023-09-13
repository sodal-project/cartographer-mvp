import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import Tabs from './Tabs';
import Button from './Button';
import Table from './Table';

function personaCustomProperties(persona) {
  const keysToFilterOut = [
    "friendlyName",
    "type",
    "status",
    "platform",
    "id",
    "upn",
    "lastVerified",
    "githubDescription",
  ];

  const filteredProperties = Object.entries(persona).reduce((accumulator, [key, value]) => {
    if (!keysToFilterOut.includes(key)) {
      accumulator[key] = value;
    }
    return accumulator;
  }, {});
  const filteredPropertiesArray = Object.keys(filteredProperties).map(key => ({ k: key, v: filteredProperties[key] }));

  return filteredPropertiesArray;
}

function TitleField({
  label,
  value
}) {
  return (
    <div className="bg-gray-800 px-4 py-2 last:rounded-r-lg">
      <label className="text-sm text-gray-400">{label}</label>
      <p className="text-sm font-bold capitalize">{value}</p>
    </div>
  )
}

function PropList({
  persona
}) {
  if (!persona) return null;
  const customProperties = personaCustomProperties(persona);

  return (
    <div className="border border-gray-700 divide-y divide-gray-700 rounded-lg">
      {customProperties.map((item, index) => (
        <div key={index}>
          <div className="flex justify-between text-md py-2 px-3">
            <div className="text-gray-400">{item.k}</div>
            <div className="text-white">{item.v}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default function Detail({
  persona,
  rowClick,
  onDeleteParticipant,
  onLinkParticipant,
  mode = null
}) {
  const [currentTab, setCurrentTab] = useState(persona?.type === "participant" ? "Agent Controls" : "Aliases");
  const [personas, setPersonas] = useState([]);
 
  const loadPersona = (upn) => {
    
    // try {
    //   const encodedUpn = encodeURIComponent(upn);
    //   const response = await fetch(`http://localhost:3001/persona?upn=${encodedUpn}`);
    //   const result = await response.json();
    //   setCurrentPersona(result);
    // } catch (error) {
    //   console.error(error);
    // }
    
    // rowClick will set the current persona - not load it
    rowClick(upn)
  }

  const fetchData = useCallback(async (persona, currentTab, setPersonas) => {
    const currentTabKey = currentTab.toLowerCase().replace(" ", "");
    const tableEndpoint = {
      controls: "persona-controls",
      obeys: "persona-obeys",
      aliases: "persona-agents",
      agentcontrols: "persona-agents-control",
      agentobeys: "persona-agents-obey",
    };
  
    if (!persona?.upn) return;
    try {
      const upn = encodeURIComponent(persona.upn);
      const response = await fetch(`http://localhost:3001/${tableEndpoint[currentTabKey]}?upn=${upn}`);
      const result = await response.json();
      setPersonas(result);
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    fetchData(persona, currentTab, setPersonas);
  }, [fetchData, persona, currentTab]);

  const onUnlinkParticipant = async (unlinkUpn) => {
    const requestData = {
      personaUpn: unlinkUpn,
      participantUpn: persona.upn,
    };

    try {
      const response = await fetch('http://localhost:3001/persona-unlink', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      });
      console.log(response)
      
      if (response.ok) {
        toast.success('Persona unlinked')
        fetchData(persona, currentTab, setPersonas)
      } else {
        console.log('error')
      }
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div className="h-full flex flex-col">
      <div className='text-white grid grid-cols-4 gap-1 w-full mt-7 mb-10 pr-24'>
        <TitleField label="ID" value={persona?.id} />
        <TitleField label="Platform" value={persona?.platform} />
        <TitleField label="Type" value={persona?.type} />
        <TitleField label="Status" value={persona?.status} />
      </div>
      <div className="detail-top px-7 grid grid-cols-2 gap-7">
        {/* <div className="detail-risk-score relative min-h-60 h-full">
          <p className="absolute top-1/2 left-1/2 text-white font-bold transform -translate-x-1/2 -translate-y-1/2">RISK SCORE</p>
          <img src="./placeholder.svg" className="w-full h-full" alt="placeholder"/>
        </div> */}
        <div className="detail-custom-fields relative">
          {/* <div className="absolute top-0 right-0">
            <Button icon={faPlus} type="outline-circle-small" click={() => { }} />
          </div> */}
          <div className="bg-gray-800 px-4 py-4 mb-8 rounded-lg">
            <p className="text-sm text-white font-bold">{persona?.upn}</p>
          </div>
          <h3 className="text-white text-md font-bold mt-2 mb-4">Custom Fields</h3>
          <PropList persona={persona} />
        </div>
        <div>
          {persona?.type !== "participant" && (
            <Button click={() => { onLinkParticipant(persona) }} label="Link to a Participant" />
          )}
          {persona?.type === "participant" && mode === "modal" && (
            <Button click={() => { onLinkParticipant() }} label="Link" />
          )}
          {persona?.type === "participant" && (
            <Button click={() => { onDeleteParticipant() }} label="Delete" />
          )}
        </div>
      </div>
      <div className="detail-tabs px-7 pt-7">
        <Tabs tabs={["Aliases", "Agent Controls", "Agent Obeys"]} current={currentTab} setCurrentTab={(tabName) => {setCurrentTab(tabName)}}/>
      </div>

      <div className="detail-table mb-7 px-7 overflow-auto flex-1">
        <Table data={personas} rowClick={(upn) => { loadPersona(upn) }} onUnlinkParticipant={onUnlinkParticipant} showAccess={true} showUnlink={persona?.type === 'participant' && currentTab !== "Aliases"} />
      </div>
    </div>
  )
}