import React, { useState, useEffect } from 'react';
import {faGears, faPen} from '@fortawesome/free-solid-svg-icons'
import Headline from '../components/Headline';
import Button from '../components/Button';
import ConfirmButton from '../components/ConfirmButton';
import IntegrationForm from '../components/IntegrationForm';

export default function Integrations() {
  const [integrations, setIntegrations] = useState([]);
  const [mode, setMode] = useState('view');
  const [editId, setEditId] = useState('');

  useEffect(() => {
    fetchData();
  }, []);
  
  const fetchData = async () => {
    try {
      const response = await fetch('http://localhost:3001/integrations');
      const integrations = await response.json();
      setIntegrations(integrations);
    } catch (error) {
      console.error(error);
    }
  };

  const submitSuccess = () => {
    fetchData();
    setMode('view');
    setEditId('');
  }

  const modeChange = (mode, id="") => {
    setMode(mode);
    setEditId(id);
  };

  const deleteItem = (itemId) => {
    fetch(`http://localhost:3001/integration-delete/${itemId}`, {
      method: 'DELETE'
    })
    .then((response) => {
      if (response.ok) {
        fetchData();
        setMode('view');
        setEditId('');
      } else {
        console.error('Error deleting item');
      }
    })
    .catch((error) => {
      console.error('Error:', error);
    });
  };

  return (
    <div className="bg-gray-900 p-10">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <Headline icon={faGears}>Integrations</Headline>
          <p className="mt-1 text-gray-300 font-sm">Manage your integrations, view <a href="https://github.com/web3rm/cartographer" target="_blank" rel="noreferrer" className="text-indigo-400 hover:text-indigo-300">setup instructions on github</a>.</p>
          <div className="mt-12 mb-6 divide-y divide-gray-800">      
            {integrations.length > 0 && integrations.sort((a, b) => a.id - b.id).map((item, index) => (
              <div key={index}>
                {editId === item.id &&
                  <div className="mb-6 mt-2">
                    <div className='flex gap-3 items-end'>
                      <IntegrationForm
                        data={item}
                        submitSuccess={submitSuccess}
                        cancelClick={() => { modeChange('view') }}
                      />
                    </div>
                  </div>
                }
                {editId !== item.id &&
                  <div className="flex gap-4 text-white py-3 cursor-pointer">
                    <div className='w-28'>{item.type}</div>
                    <div className='w-48'>{item.name}</div>
                    <div className='w-36'>*******************</div>
                    <Button icon={faPen} type="link" click={() => { modeChange('view', item.id) }} />
                    <ConfirmButton click={() => { deleteItem(item.id) }} />
                  </div>
                }
              </div>
            ))}
          </div>
          <div className="mt-12">
            {mode === 'view' &&
              <Button label="Add" click={() => { modeChange('add') }} />
            }
            {mode === 'add' &&
              <IntegrationForm
                submitSuccess={submitSuccess}
                cancelClick={() => { modeChange('view') }}
              />
            }
          </div>
        </div>
      </div>
    </div>
  )
}