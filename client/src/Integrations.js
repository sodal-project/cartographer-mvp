import React, { useState, useEffect } from 'react';
import Button from './Button';

const Field = ({
  label,
  name,
  value,
  handleChange
}) => {
  const id = label.toLowerCase().replace(' ', '-'); 
  return (
    <div className="flex-1">
      <label htmlFor={id} className="block text-sm font-medium leading-6 text-white">
        {label}
      </label>
      <div className="mt-2">
        <input
          type="text"
          name={name}
          id={id}
          defaultValue={value}
          onChange={handleChange}
          className="block w-full rounded-md border-0 bg-white/5 p-2 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
        />
      </div>
    </div>
  )
}

const Form = ({
  submitSuccess,
  cancelClick,
  name,
  token,
  type,
  id
}) => {
  const [formData, setFormData] = useState({
    id: id || '',
    type: type || 'github', // Set the default value to "github"
    name: name || '',
    token: token || ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3001/add-integration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        submitSuccess();
        console.log(data); // Data received successfully
      } else {
        throw new Error('Request failed');
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex gap-4 w-full max-w-4xl items-end">
        <div className="w-28">
          <label htmlFor="type" className="block text-sm font-medium leading-6 text-white">
            Type
          </label>
          <div className="mt-2">
            <select
              id="type"
              name="type"
              value={formData.type} // Set the value to the state value
              onChange={handleChange}
              className="block w-full rounded-md border-0 bg-white/5 py-2.5 px-1 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6 [&_*]:text-black"
            >
              <option value="github">Github</option>
              <option value="google">Google</option>
              <option value="slack">Slack</option>
            </select>
          </div>
        </div>
        <Field label="Name" value={formData.name} name="name" handleChange={handleChange} />
        <Field label="Token" value={formData.token} name="token" handleChange={handleChange} />
        <input type="hidden" name="id" value={formData.id} />
        <div className="flex gap-3 mt-6">
          <Button label="Save" submit />
          <Button label="Cancel" type="outline" click={cancelClick} />
        </div>
      </div>
    </form>
  )
}

export default function Integrations() {
  const [integrations, setIntegrations] = useState([]);
  const [mode, setMode] = useState('view');
  const [editId, setEditId] = useState('');

  const fetchData = async () => {
    try {
      const response = await fetch('http://localhost:3001/integrations');
      const integrations = await response.json();
      setIntegrations(integrations);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const submitSuccess = () => {
    fetchData();
    setMode('view');
    setEditId('');
  }

  const handleModeChange = (mode, id="") => {
    setMode(mode);
    setEditId(id);
  };

  return (
    <div className="bg-gray-900 p-10">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-3xl font-semibold leading-6 text-white">Integrations</h1>
          <div className="mt-12 mb-6 divide-y divide-gray-800">
            {integrations.sort((a, b) => a.id - b.id).map((item, index) => (
              <div key={index}>
                {editId === item.id &&
                  <div className="mb-6 mt-2">
                    <div className='flex gap-3 items-end'>
                      <Form 
                        type={item.type}
                        name={item.name}
                        token={item.token}
                        id={item.id}
                        submitSuccess={submitSuccess}
                        cancelClick={() => { handleModeChange('view') }}
                      />
                    </div>
                  </div>
                }
                {editId !== item.id &&
                  <div className="flex gap-4 text-white py-3 cursor-pointer">
                    <div className='w-28'>{item.type}</div>
                    <div className='w-48'>{item.name}</div>
                    <div className='w-36'>*******************</div>
                    <a onClick={() => { handleModeChange('view', item.id) }} className="text-indigo-400 hover:text-indigo-300 ml-6">
                      Edit
                    </a>
                    <a href="#" className="text-indigo-400 hover:text-indigo-300">
                      Delete
                    </a>
                  </div>
                }
              </div>
            ))}
          </div>
          <div className="mt-12">
            {mode === 'view' &&
              <Button label="Add" click={() => { handleModeChange('add') }} />
            }
            {mode === 'add' &&
              <Form
                submitSuccess={submitSuccess}
                cancelClick={() => { handleModeChange('view') }}
              />
            }
          </div>
        </div>
      </div>
    </div>
  )
}