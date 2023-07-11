import React, { useState } from 'react';
import Button from './Button';

const data = [
  {
    label: 'Github @tbenbow',
    value: 'AKDO832l987LS780L978345lkasO'
  },
  {
    label: 'Github @tbenbowadmin',
    value: 'BNSDLU8230267LKSDF037120kasl'
  }
]

const Field = ({
  label,
  value
}) => {
  return (
    <div className="sm:col-span-2 sm:col-start-1 w-60">
      <label htmlFor="city" className="block text-sm font-medium leading-6 text-white">
        {label}
      </label>
      <div className="mt-2">
        <input
          type="text"
          name="city"
          id="city"
          autoComplete="address-level2"
          className="block w-full rounded-md border-0 bg-white/5 py-2 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
        />
      </div>
    </div>
  )
}

export default function Integrations() {
  const [mode, setMode] = useState('view');

  const handleModeChange = (mode) => {
    setMode(mode);
  };

  return (
    <div className="bg-gray-900 p-10">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold leading-6 text-white">Integrations</h1>
          {mode}
          <div className="mt-12 mb-6 divide-y divide-gray-800">
            
            { data.map((item) => (
              <div className="flex text-white py-3 hover:bg-violet-600/10 cursor-pointer">
                <div className='w-80'>{item.label}</div>
                <div>************************</div>
                <div className="ml-16">
                  <a href="#" className="text-indigo-400 hover:text-indigo-300">
                    Edit<span className="sr-only"></span>
                  </a>
                </div>
                <div className="ml-4">
                  <a href="#" className="text-indigo-400 hover:text-indigo-300">
                    Delete<span className="sr-only"></span>
                  </a>
                </div>
              </div>
            ))}
            
            {mode === 'edit' && 
              <div>
                <div className="flex gap-4 items-end mt-8">
                  <div className="w-40">
                    <label htmlFor="country" className="block text-sm font-medium leading-6 text-white">
                      Type
                    </label>
                    <div className="mt-2">
                      <select
                        id="country"
                        name="country"
                        autoComplete="country-name"
                        className="block w-full rounded-md border-0 bg-white/5 py-2.5 px-1 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6 [&_*]:text-black"
                      >
                        <option>Github</option>
                        <option>Google</option>
                        <option>Slack</option>
                      </select>
                    </div>
                  </div>
                  <Field label="name" />
                  <Field label="value" />
                  <div className='relative -top-1'>
                  </div>
                </div>
              </div>
            }
          </div>
          {mode === 'view' && 
            <Button label="Add" click={() => { handleModeChange('edit') }} />
          }
          {mode === 'edit' && 
            <div className='flex gap-3'>
              <Button label="Save" click={() => { handleModeChange('view') }} />
              <Button label="Cancel" click={() => { handleModeChange('view') }} />
            </div>
          }
        </div>
      </div>
    </div>
  )
}