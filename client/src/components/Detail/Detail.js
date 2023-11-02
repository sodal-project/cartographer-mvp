import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import Button from '../Button';
import DetailUpn from './DetailUpn';
import DetailTitle from './DetailTitle';
import DetailFields from './DetailFields';
import Table from '../Table';
import Tabs from '../Tabs';

export default function Detail({
  persona,
  rowClick,
  onDeleteParticipant,
  onLinkParticipant,
  mode = null
}) {
  const isParticipant = persona?.type === "participant";
  const tableTabs = isParticipant ? ["Participant Controls"] : ["Aliases", "Agent Controls", "Agent Obeys"];

  const [currentTab, setCurrentTab] = useState(isParticipant ? "Participant Controls" : "Aliases");
  const [personas, setPersonas] = useState([]);
  const [orderBy, setOrderBy] = useState("friendlyName")
  const [orderByDirection, setOrderByDirection] = useState("ASC")
 
  const loadPersona = (upn) => {
    rowClick(upn)
  }

  const fetchData = useCallback(async (persona, currentTab, setPersonas) => {
    const currentTabKey = currentTab.toLowerCase().replace(" ", "");
    const tableEndpoint = {
      participantcontrols: "persona",
      aliases: "persona-agents",
      agentcontrols: "persona-agents-control",
      agentobeys: "persona-agents-obey",
    };
  
    if (!persona?.upn) return;
    try {
      const upn = encodeURIComponent(persona.upn);
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/${tableEndpoint[currentTabKey]}?upn=${upn}&orderBy=${orderBy}&orderByDirection=${orderByDirection}`);
      const result = await response.json();
      setPersonas(result);
      // setCurrentPersona(result);
    } catch (error) {
      console.error(error);
    }
  }, [orderBy, orderByDirection]);

  useEffect(() => {
    fetchData(persona, currentTab, setPersonas);
  }, [fetchData, persona, currentTab, orderBy, orderByDirection]);
  
  useEffect(() => {
    const activeTab = isParticipant ? "Participant Controls" : "Aliases";
    setCurrentTab(activeTab);
  }, [isParticipant]);

  const onUnlinkParticipant = async (unlinkUpn) => {
    const requestData = {
      personaUpn: unlinkUpn,
      participantUpn: persona.upn,
    };

    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/persona-unlink`, {
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

  const handleLinkParticipant = () => {
    onLinkParticipant(null, () => fetchData(persona, currentTab, setPersonas))
  }

  const onSortTable = (orderBy, orderByDirection) => {
    setOrderBy(orderBy)
    setOrderByDirection(orderByDirection)
  }

  const onEditParticipant = () => {
    console.log('edit participant')
  }
  
  return (
    <div className="h-full flex flex-col">
      <div className="flex p-6 pb-10">
        <div className="w-1/2">
          <DetailTitle persona={persona} onDeleteParticipant={onDeleteParticipant} onEditParticipant={onEditParticipant} />
        </div>
        <div className="w-1/2 pr-16">
          <DetailUpn upn={persona?.upn} />
        </div>
      </div>
      <div className="flex px-6 gap-4">
        <div className="w-2/3">
          <DetailFields persona={persona} onFieldsUpdate={() => console.log('update the fields')} />
        </div>
        {isParticipant && (
          <div className="w-1/3">
            <div className="rounded-lg border border-gray-600 h-40 p-4">
              <h4 className="text-white text-sm font-bold">Notes</h4>
            </div>
          </div>
          )}
      </div>

      <div className="detail-top px-7 grid grid-cols-2 gap-7">
        <div>
          <div className="flex gap-3 py-1">
          {persona?.type !== "participant" && (
            <Button click={() => { onLinkParticipant(persona) }} label="Link to a Participant" />
          )}
          {persona?.type === "participant" && mode === "modal" && (
            <Button click={() => { handleLinkParticipant() }} label="Link" />
          )}
          </div>
        </div>
      </div>

      <div className="detail-tabs px-7 pt-7">
        <Tabs tabs={tableTabs} current={currentTab} setCurrentTab={(tabName) => {setCurrentTab(tabName)}}/>
      </div>
      <div className="detail-table mb-7 px-7 overflow-auto flex-1">
        <Table
          data={personas}
          rowClick={(upn) => { loadPersona(upn) }}
          onUnlinkParticipant={onUnlinkParticipant}
          showAccess={true}
          showUnlink={isParticipant && currentTab !== "Aliases"}
          onSortTable={onSortTable}
          orderBy={orderBy}
          orderByDirection={orderByDirection}
        />
      </div>
    </div>
  )
}