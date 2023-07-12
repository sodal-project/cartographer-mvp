import React, { useState } from 'react';
import Button from './Button';

const data = [
  {
    id: '1',
    type: 'Github',
    name: '@tbenbow',
    value: 'AKDO832l987LS780L978345lkasO'
  },
  {
    id: '2',
    type: 'Github',
    name: '@tbenbowadmin',
    value: 'BNSDLU8230267LKSDF037120kasl'
  }
]

const Field = ({
  label,
  value
}) => {
  return (
    <div className="flex-1">
      <label htmlFor="city" className="block text-sm font-medium leading-6 text-white">
        {label}
      </label>
      <div className="mt-2">
        <input
          type="text"
          name="city"
          id="city"
          value={value}
          autoComplete="address-level2"
          className="block w-full rounded-md border-0 bg-white/5 p-2 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
        />
      </div>
    </div>
  )
}

const Form = ({saveClick, cancelClick, name, value, type, id}) => {
  return (
    <div className="flex gap-4 w-full max-w-4xl items-end">
      <div className="w-28">
        <label htmlFor="country" className="block text-sm font-medium leading-6 text-white">
          Type
        </label>
        <div className="mt-2">
          <select
            id="type"
            name="type"
            className="block w-full rounded-md border-0 bg-white/5 py-2.5 px-1 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6 [&_*]:text-black"
          >
            <option>Github</option>
            <option>Google</option>
            <option>Slack</option>
          </select>
        </div>
      </div>
      <Field label="Name" value={name} />
      <Field label="Token" value={value} />
      <div className='flex gap-3 mt-6'>
        <Button label="Save" click={() => { saveClick() }} />
        <Button label="Cancel" click={() => { cancelClick() }} />
      </div>
    </div>
  )
}

export default function Integrations() {
  const [mode, setMode] = useState('view');
  const [editId, setEditId] = useState('');

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
            {data.map((item) => (
              <div>
                {editId === item.id &&
                  <div className="mb-6 mt-2">
                    <div className='flex gap-3 items-end'>
                      <Form name={item.name} value={item.value} id={item.id} saveClick={() => { handleModeChange('view') }} cancelClick={() => { handleModeChange('view') }}/>
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
              <Form name="" value="" id="" saveClick={() => { handleModeChange('view') }} cancelClick={() => { handleModeChange('view') }}/>
            }
          </div>
        </div>
      </div>
    </div>
  )
}