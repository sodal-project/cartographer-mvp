import React, { useState, useEffect } from 'react';
import {faPlus} from '@fortawesome/free-solid-svg-icons'
import Tabs from './Tabs';
import Button from './Button';
import Table from './Table';


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
  items
}) {
  return (
    <div className="border border-gray-700 divide-y divide-gray-700 rounded-lg">
      {items.map(item => (
        <div className="flex justify-between text-md py-2 px-3">
        <div className="text-gray-400">{item.label}</div>
        <div className="text-white">{item.value}</div>
      </div>
      ))}
    </div>
  )
}

export default function Detail({
  persona
}) {
  const [currentTab, setCurrentTab] = useState("Controls");
  const [controlsPersonas, setControlsPersonas] = useState([]);
  const [obeysPersonas, setObeysPersonas] = useState([]);
  const [aliasPersonas, setAliasPersonas] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);


  const fetchData = async () => {
    try {
      const response = await fetch(`http://localhost:3001/personas?page=1&pageSize=300`);
      const nodes = await response.json();
      const personas = nodes.map(node => node.properties);
      setControlsPersonas(personas);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className='text-white grid grid-cols-4 gap-1 w-full mt-7 mb-10 pr-24'>
        <TitleField label="ID" value={persona?.id} />
        <TitleField label="Platform" value={persona?.platform} />
        <TitleField label="Type" value={persona?.type} />
        <TitleField label="Status" value={persona?.status} />
      </div>
      <div className="detail-top px-7 grid grid-cols-2 gap-7">
        <div className="detail-risk-score relative min-h-60 h-full">
          <p className="absolute top-1/2 left-1/2 text-white font-bold transform -translate-x-1/2 -translate-y-1/2">RISK SCORE</p>
          <img src="./placeholder.svg" className="w-full h-full" />
        </div>
        <div className="detail-custom-fields relative">
          <h3 className="text-white text-md font-bold mt-2 mb-4">Custom Fields</h3>
          <div className="absolute top-0 right-0">
            <Button icon={faPlus} type="outline-circle-sm" click={() => { }} />
          </div>
          <PropList items={[
            { label: "Custom", value: "Unique" },
            { label: "Other", value: "Another One" },
            { label: "Attribute", value: "Option" },
            { label: "Activity", value: "High" },
            { label: "Level", value: "Maximum" },
          ]} />
        </div>
      </div>
      <div className="detail-tabs px-7 pt-7">
        <Tabs tabs={["Controls", "Obeys", "Aliases"]} current={currentTab} setCurrentTab={(tabName) => {setCurrentTab(tabName)}}/>
      </div>
      <div className="detail-table mb-7 px-7 overflow-auto flex-1">
        <Table data={controlsPersonas} rowClick={() => { console.log("row click")}} />
      </div>
    </div>
  )
}