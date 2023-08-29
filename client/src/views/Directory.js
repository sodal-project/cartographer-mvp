import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAddressBook } from '@fortawesome/free-regular-svg-icons';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { faX } from '@fortawesome/free-solid-svg-icons';
import Button from '../components/Button';
import Detail from '../components/Detail';
import Discovery from '../components/Discovery/Discovery';
import Headline from '../components/Headline';
import Pagination from '../components/Pagination';
import ParticipantAdd from '../components/ParticipantAdd';
import ParticpantLinkModal from '../components/ParticipantLinkModal';
import Table from '../components/Table';

export default function Directory() {
  const [personas, setPersonas] = useState([]);
  const [personaCount, setPersonaCount] = useState(0);
  const [perPage, setPerPage] = useState(100);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentPersonaUpn, setCurrentPersonaUpn] = useState(null);
  const [currentPersona, setCurrentPersona] = useState(null);
  const [mode, setMode] = useState("list")
  const [linkModalOpen, setLinkModalOpen] = useState(false)
  const [addModalOpen, setAddModalOpen] = useState(false)

  // Load Personas
  const fetchData = async (filters) => {
    let endpoint
    if (filters?.length > 0) {
      endpoint = `http://localhost:3001/personas?filterQuery=${JSON.stringify(filters)}&page=${currentPage}&pageSize=${perPage}`
    } else {
      endpoint = `http://localhost:3001/personas?page=${currentPage}&pageSize=${perPage}`
    }
    try {
      const response = await fetch(endpoint);
      const nodes = await response.json();
      if (nodes?.length > 0){
        const personas = nodes.map(node => node.properties);
        setPersonas(personas);
      } else {
        setPersonas([])
      }
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
  const toggleDiscovery = () => {
    if (mode === "filter") {
      setMode("list")
    } else if (mode === "list") {
      setMode("filter")
    }
  }
  const selectPersona = (upn) => {
    setMode("detail")
    setCurrentPersonaUpn(upn)
    setCurrentPersona(personas.find(persona => persona.upn === upn))
  }
  const discoveryUpdate = (filters) => {
    fetchData(filters)
  }
  
  // Link a persona to a participant
  const toggleLinkModal = (persona) => {
    console.log('this needs to show the current persona', currentPersona)
    setLinkModalOpen(!linkModalOpen)
  }
  
  const toggleAddModal = () => {
    setAddModalOpen(!addModalOpen)
  }
  
  return (
    <div className="relative bg-gray-900 h-screen flex">
      <div className="bg-gray-900 w-full h-screen flex flex-col">
        <div className="flex-1 overflow-auto">
          <div className="flex items-center px-10 py-7">
            <Headline icon={faAddressBook}>Directory</Headline>
            <div className="flex gap-4 flex-none mr-3">
              <Button label="Add Participant" click={toggleAddModal} />
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
      
      {/* Filter Mode */}
      <div
        className={`${mode === "filter" ? "" : "translate-x-full"} transition-all absolute h-full right-0 bg-gray-900`}
        style={{ boxShadow: "0 0 50px 0 rgba(0,0,0,.6)", width: "400px" }}
      >
        <div
          className="relative bg-indigo-500 rounded-l-md w-10 h-10 absolute top-7 -left-10 cursor-pointer hover:bg-indigo-400"
          style={{ boxShadow: "0 0 50px 0 rgba(0,0,0,.6)"}}
          onClick={() => { toggleDiscovery() }}
        >
          <FontAwesomeIcon className="absolute top-2.5 left-2.5 text-white" icon={faMagnifyingGlass} size="lg" />
        </div>
        <div className="absolute inset-0 overflow-hidden">
          <div className='p-6 h-full overflow-auto'>
            <h1 className="text-xl font-semibold leading-6 text-white py-2 mb-6">Discovery</h1>
            <Discovery onUpdate={discoveryUpdate} />
          </div>
        </div>
      </div>

      {/* Detail Mode */}
      <div
        className={`${mode === "detail" ? "" : "hidden"} absolute h-full left-72 right-0 bg-gray-900 overflow-hidden`}
        style={{ boxShadow: "0 0 50px 0 rgba(0,0,0,.6)" }}
      >
        <Detail persona={currentPersona} rowClick={(upn) => selectPersona(upn) } onLinkParticipant={toggleLinkModal} />
        <div className="absolute top-6 right-6">
          <Button icon={faX} type="outline-circle" click={() => { closeDetail() }} />
        </div>
      </div>

      {/* Participant Add Modal */}
      {addModalOpen && (
        <>
          <div className="fixed inset-0 z-30">
            <div className="absolute inset-0 -z-10 bg-black opacity-90" onClick={toggleAddModal}></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80">
              <div className="relative bg-gray-900 rounded-lg border border-gray-700 h-full px-4">
                <h3 className="mt-3 text-white font-semibold">Add a Participant</h3>
                <ParticipantAdd onCancel={toggleAddModal} onSuccess={toggleAddModal} />
              </div>
            </div>
          </div>
        </>
      )}

      {/* Participant Link Modal */}
      {linkModalOpen && (
        <>
          <div className="fixed inset-0 z-30">
            <div className="absolute inset-0 -z-10 bg-black opacity-90" onClick={toggleLinkModal}></div>
            <div className="absolute top-20 bottom-20 left-20 right-20">
              <ParticpantLinkModal currentPersona={currentPersona} />
            </div>
          </div>
        </>
      )}
    </div>
  )
}