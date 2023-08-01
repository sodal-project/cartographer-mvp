import React, { useState } from 'react';
import Bubble from './Bubble';
import Button from './Button';

export default function DiscoveryAddFilter({
  save,
  cancel
}) {
  const [selectedField, setSelectedField] = useState('ID');
  const [selectedOperator, setSelectedOperator] = useState('=');
  const [inputValue, setInputValue] = useState('');

  const saveFilter = (event) => {
    event.preventDefault();
    save({
      field: selectedField,
      operator: selectedOperator,
      value: inputValue
    })
  }

  return (
    <Bubble title="Add Filter" className="absolute top-16 left-1/2 -translate-x-1/2">
      <form onSubmit={saveFilter}>
        <div className='w-full'>
          <select
            className="w-full text-white bg-gray-900 border border-gray-600 text-sm mb-4"
            value={selectedField}
            onChange={(event) => setSelectedField(event.target.value)}
          >
            <option value="ID">ID</option>
            <option value="Platform">Platform</option>
            <option value="Type">Type</option>
          </select>
          <select
            className="w-full text-white bg-gray-900 border border-gray-600 text-sm mb-4"
            value={selectedOperator}
            onChange={(event) => setSelectedOperator(event.target.value)}
          >
            <option value="=">=</option>
            <option value="≠">≠</option>
            <option value="&gt;">&gt;</option>
          </select>
          <input
            className="w-full text-white bg-gray-900 border border-gray-600 text-sm mb-4"
            value={inputValue}
            onChange={(event) => setInputValue(event.target.value)}
          />
          <div className="flex gap-4 items-center mx-auto">
            <Button label="Add Filter" submit />
            <Button label="Cancel" type="outline" click={cancel} />
          </div>
        </div>
      </form>
    </Bubble>
  )
}