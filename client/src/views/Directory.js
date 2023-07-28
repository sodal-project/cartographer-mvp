import React, { useState, useEffect } from 'react';
import { faAddressBook } from '@fortawesome/free-regular-svg-icons';
import { faX } from '@fortawesome/free-solid-svg-icons';
import Button from '../components/Button';
import Detail from '../components/Detail';
import Headline from '../components/Headline';
import Pagination from '../components/Pagination';
import ParticpantForm from '../components/ParticipantForm';
import Table from '../components/Table';

export default function Directory() {
  const [personas, setPersonas] = useState([]);
  const [personaCount, setPersonaCount] = useState(0);
  const [perPage, setPerPage] = useState(100);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentPersonaUpn, setCurrentPersonaUpn] = useState(null);
  const [currentPersona, setCurrentPersona] = useState(null);
  const [mode, setMode] = useState("list")

  // Load Personas
  const fetchData = async () => {
    try {
      const response = await fetch(`http://localhost:3001/personas?page=${currentPage}&pageSize=${perPage}`);
      const nodes = await response.json();
      const personas = nodes.map(node => node.properties);
      setPersonas(personas);
    } catch (error) {
      console.error(error);
    }
  };

  // Load Persona Count
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

  // Load Personas When Page Changes
  useEffect(() => {
    fetchData();
  }, [currentPage, perPage]);
 

  // Load Persona when currentPersonaUpn changes
  useEffect(() => {
    if (!currentPersonaUpn) return;

    const fetchPersona = async () => {
      try {
        const response = await fetch(`http://localhost:3001/persona?upn=${currentPersonaUpn}`);
        const persona = await response.json();
        console.log('persona', persona)
        setCurrentPersona(persona);
      } catch (error) {
        console.error(error);
      }
    };

    fetchPersona();
  }, [currentPersonaUpn])

  const closeDetail = () => {
    setMode("list")
    setCurrentPersonaUpn(null)
  }
  const selectPersona = (upn) => {
    setMode("detail")
    setCurrentPersonaUpn(upn)
    setCurrentPersona(personas.find(persona => persona.upn === upn))
  }
  
  return (
    <div className="relative bg-gray-900 h-screen flex">
      <div className="bg-gray-900 w-full h-screen flex flex-col">
        <div className="flex-1 overflow-auto">
          <div className="flex items-center p-10">
            <Headline icon={faAddressBook}>Directory</Headline>
            <div className="flex-none">
              <Button label="Add Participant" click={() => { setMode("add") }} />
            </div>
          </div>
          <div className="px-10">
            <Table data={personas} rowClick={selectPersona} currentPersonaUpn={currentPersonaUpn} />
          </div>
        </div>
        <div className="text-white py-6 px-10 border-t border-gray-700">
          <Pagination
            itemCount={personaCount}
            perPage={perPage}
            currentPage={currentPage}
            prevClick={() => { setCurrentPage(currentPage - 1) }}
            nextClick={() => { setCurrentPage(currentPage + 1) }}
            changePerPage={(e) => { setPerPage(e.target.value) }}
          />
        </div>
      </div>
      
      {/* Edit Mode */}
      <div
        className={`${mode === "add" ? "" : "hidden"} absolute h-full left-72 right-0 bg-gray-900 overflow-hidden`}
        style={{ boxShadow: "0 0 50px 0 rgba(0,0,0,.6)" }}
      >
        <div className='p-6 h-full overflow-auto'>
          <Headline>Add Participant</Headline>
          <ParticpantForm />
        </div>
        <div className="absolute top-6 right-6">
          <Button icon={faX} type="outline-circle" click={() => { closeDetail() }} />
        </div>
      </div>

      {/* Detail Mode */}
      <div
        className={`${mode === "detail" ? "" : "hidden"} absolute h-full left-72 right-0 bg-gray-900 overflow-hidden`}
        style={{ boxShadow: "0 0 50px 0 rgba(0,0,0,.6)" }}
      >
        <Detail persona={currentPersona} rowClick={(upn) => selectPersona(upn) }/>
        <div className="absolute top-6 right-6">
          <Button icon={faX} type="outline-circle" click={() => { closeDetail() }} />
        </div>
      </div>
      
    </div>
  )
}