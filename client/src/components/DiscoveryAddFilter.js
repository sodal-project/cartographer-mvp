import React, { useState } from 'react';
import Bubble from './Bubble';
import Button from './Button';

export default function DiscoveryAddFilter({
  onSave,
  cancel
}) {
  const [selectedField, setSelectedField] = useState('id');
  const [selectedFieldDropdown, setSelectedFieldDropdown] = useState('id');
  const [selectedOperator, setSelectedOperator] = useState('=');
  const [inputValue, setInputValue] = useState('');

  const addItem = () => {
    onSave({
      type: 'filterField',
      name: selectedField,
      operator: selectedOperator,
      value: inputValue
    })
  }

  const onSelectedFieldDropdownChange = (value) => {
    setSelectedFieldDropdown(value);
    if (value === 'custom') {
      setSelectedField('');
    } else {
      setSelectedField(value);
    }
  }

  return (
    <Bubble title="Add Filter" className="absolute top-16 left-1/2 -translate-x-1/2 z-10">
      <div className='w-full'>
        <div className="mb-4">
          <select
            className="w-full text-white bg-gray-900 border border-gray-600 text-sm"
            value={selectedFieldDropdown}
            onChange={(event) => onSelectedFieldDropdownChange(event.target.value)}
          >
            <option value="id">ID</option>
            <option value="platform">Platform</option>
            <option value="type">Type</option>
            <option value="status">Status</option>
            <option value="upn">UPN</option>
            <option value="friendlyName">Friendly Name</option>
            <option value="custom">Custom</option>
          </select>
          <input
            className={`w-full text-white bg-gray-900 border border-gray-600 border-t-0 text-sm ${(selectedFieldDropdown === 'custom') ? '' : 'hidden'}`}
            value={selectedField}
            onChange={(event) => setSelectedField(event.target.value)}
          />
        </div>
      

        <select
          className="w-full text-white bg-gray-900 border border-gray-600 text-sm mb-4"
          value={selectedOperator}
          onChange={(event) => setSelectedOperator(event.target.value)}
        >
          <option value="=">=</option>
          <option value="≠">≠</option>
          <option value="&gt;">&gt;</option>
          <option value="&lt;">&lt;</option>
        </select>
        <input
          className="w-full text-white bg-gray-900 border border-gray-600 text-sm mb-4"
          value={inputValue}
          onChange={(event) => setInputValue(event.target.value)}
        />
        <div className="flex gap-4 items-center mx-auto">
          <Button label="Add Filter" click={addItem} />
          <Button label="Cancel" type="outline" click={cancel} />
        </div>
      </div>
    </Bubble>
  )
}