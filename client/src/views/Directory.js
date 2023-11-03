import React, { useState } from 'react';
import { useLoaderData, useLocation, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAddressBook } from '@fortawesome/free-regular-svg-icons';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { faX } from '@fortawesome/free-solid-svg-icons';
import Button from '../components/Button';
import Detail from '../components/Detail/Detail';
import Discovery from '../components/Discovery/Discovery';
import Headline from '../components/Headline';
import Pagination from '../components/Pagination';
import ParticipantAdd from '../components/ParticipantAdd';
import ParticpantLinkModal from '../components/ParticipantLinkModal';
import Table from '../components/Table';

export default function Directory() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const currentUpn = queryParams.get('upn');
  const { personas, personaCount, page, pageSize } = useLoaderData()
  const [showDiscovery, setShowDiscovery] = useState(false)
  const [showLinkModal, setShowLinkModal] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [filters, setFilters] = useState([]);
  
  const discoveryUpdate = (filters) => {
    setFilters(filters)
  }
  
  // Toggles
  const closeDetail = () => {
    queryParams.delete('upn');
    navigate(`${location.pathname}?${queryParams.toString()}`);
  }
  const toggleLinkModal = (persona) => {
    setShowLinkModal(!showLinkModal)
  }
  const toggleAddModal = () => {
    setShowAddModal(!showAddModal)
  }
  const toggleDiscovery = () => {
    setShowDiscovery(!showDiscovery)
  }

  // Participant Management
  // TODO: This could move to it's own component or the Detail component
  const deleteParticipant = async () => {
    fetch(`${process.env.REACT_APP_API_BASE_URL}/persona/${currentUpn}`, {
      method: 'DELETE'
    })
      .then((response) => {
        if (response.ok) {
          console.log('Persona deleted');
          closeDetail()
          // fetchData()
        } else {
          console.error('Error deleting persona');
        }
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  }

  const handleParticipantAdded = () => {
    setShowAddModal(!showAddModal)
  }

  return (
    <div className="relative bg-gray-900 h-screen flex">
      <div className="bg-gray-900 w-full h-screen flex flex-col">
        <div className="flex-1 overflow-auto">
          <div className="flex gap-4 items-center px-10 py-7">
            <div>
              <Headline icon={faAddressBook}>Directory</Headline>
            </div>
            <div className="flex gap-4 flex-none mr-3">
              <Button label="Add Participant" click={toggleAddModal} type="outline" />
            </div>
          </div>
          <div className="px-10">
            <Table
              data={personas}
              currentPersonaUpn={currentUpn}
              // orderBy={orderBy}
              // orderByDirection={orderByDirection}
            />
          </div>
        </div>
        <div className="text-white py-6 px-10 border-t border-gray-700">
          <Pagination
            itemCount={Number(personaCount)}
            pageSize={Number(pageSize)}
            page={Number(page)}
          />
        </div>
      </div>

      {/* Filter Mode */}
      <div
        className={`${showDiscovery ? "" : "translate-x-full"} transition-all fixed h-full right-0 bg-gray-900`}
        style={{ boxShadow: "0 0 50px 0 rgba(0,0,0,.6)", width: "480px" }}
      >
        <div
          className="relative bg-indigo-500 rounded-l-md w-10 h-10 absolute top-7 -left-10 cursor-pointer hover:bg-indigo-400"
          style={{ boxShadow: "0 0 50px 0 rgba(0,0,0,.6)" }}
          onClick={() => { toggleDiscovery() }}
        >
          <FontAwesomeIcon className="absolute top-2.5 left-2.5 text-white" icon={faMagnifyingGlass} size="lg" />
        </div>
        <div className="absolute inset-0 overflow-hidden">
          <div className='p-6 h-full overflow-auto'>
            <Discovery onUpdate={discoveryUpdate} />
          </div>
        </div>
      </div>

      {/* Detail Mode */}
      {currentUpn && (
        <div
          className={`absolute h-full left-72 right-0 bg-gray-900 overflow-hidden`}
          style={{ boxShadow: "0 0 50px 0 rgba(0,0,0,.6)" }}
        >
          {/* <Detail onLinkParticipant={toggleLinkModal} onDeleteParticipant={deleteParticipant} /> */}
          <Detail currentUpn={currentUpn} onDeleteParticipant={deleteParticipant}/>
          <div className="absolute top-7 right-7">
            <Button icon={faX} type="outline-circle" click={() => { closeDetail() }} />
          </div>
        </div>
      )}

      {/* Participant Add Modal */}
      {showAddModal && (
        <>
          <div className="fixed inset-0 z-30">
            <div className="absolute inset-0 -z-10 bg-black opacity-90" onClick={toggleAddModal}></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80">
              <div className="relative bg-gray-900 rounded-lg border border-gray-700 h-full px-4">
                <h3 className="mt-3 text-white font-semibold">Add a Participant</h3>
                <ParticipantAdd onCancel={toggleAddModal} onSuccess={handleParticipantAdded} />
              </div>
            </div>
          </div>
        </>
      )}

      {/* Participant Link Modal */}
      {showLinkModal && (
        <>
          <div className="fixed inset-0 z-30">
            <div className="absolute inset-0 -z-10 bg-black opacity-90" onClick={toggleLinkModal}></div>
            <div className="absolute top-20 bottom-20 left-20 right-20">
              {/* <ParticpantLinkModal currentPersona={currentPersona} onAddSuccess={fetchData} /> */}
            </div>
          </div>
        </>
      )}
    </div>
  )
}