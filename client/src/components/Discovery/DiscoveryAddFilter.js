import React, { useState } from 'react';
import Bubble from '../Bubble';
import Button from '../Button';

const fieldOptions = ["id","platform","type","status","upn","friendlyName","custom"]

export default function DiscoveryAddFilter({
  onSave,
  onCancel,
  data = {}
}) {
  const [selectedField, setSelectedField] = useState(initialSelectField());
  const [selectedFieldDropdown, setSelectedFieldDropdown] = useState(initialSelectField());
  const [selectedOperator, setSelectedOperator] = useState(data.operator || '=');
  const [inputValue, setInputValue] = useState(data.value || '');
  const [valuePlaceholder, setValuePlaceholder] = useState('id');

  function initialSelectField() {
    if (fieldOptions.includes(data.name)) {
      return data.name;
    } else if (data.name) {
      return 'custom';
    }
    return 'id';
  }

  const handleSave = () => {
    onSave({
      type: 'filterField',
      name: selectedField,
      operator: selectedOperator,
      value: inputValue
    })
  }

  const handleSelectedFieldDropdownChange = (value) => {
    setSelectedFieldDropdown(value);
    
    // If we have a custom field then clear the selected field value
    if (value === 'custom') {
      setSelectedField('');
    } else {
      setSelectedField(value);
    }

    // Set value to something included in the dropdown displayed
    if (value === 'platform') {
      setInputValue('directory');
    } else if (value === 'type') {
      setInputValue('participant');
    } else if (value === 'status') {
      setInputValue('active');
    } else {
      setInputValue('');
    }

    // Set the value placeholder if we have a field type that requires it
    if (value === 'id') {
      setValuePlaceholder('ID')
    } else if (value === 'upn') {
      setValuePlaceholder('UPN')
    } else if (value === 'friendlyName') {
      setValuePlaceholder('Friendly Name')
    } else if (value === 'custom') {
      setValuePlaceholder('Custom')
    }
  }

  const title = data.id ? 'Edit Filter' : 'Add Filter'
  const saveLabel = data.id ? 'Save' : 'Add Filter'

  return (
    <Bubble title={title} className="absolute top-16 left-1/2 -translate-x-1/2 z-10">
      <div className='w-full'>
        <div className="mb-4">

          {/* Name */}
          <select
            className="w-full text-white bg-gray-900 border border-gray-600 text-sm"
            value={selectedFieldDropdown}
            onChange={(event) => handleSelectedFieldDropdownChange(event.target.value)}
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
      
        {/* Operator */}
        <select
          className="w-full text-white bg-gray-900 border border-gray-600 text-sm mb-4"
          value={selectedOperator}
          onChange={(event) => setSelectedOperator(event.target.value)}
        >
          <option value="=">=</option>
          <option value="≠">≠</option>
          <option value="&gt;">&gt;</option>
          <option value="&lt;">&lt;</option>
          <option value="&gt;=">&gt;=</option>
          <option value="&lt;=">&lt;=</option>
          <option value="contains">contains</option>
          <option value="startsWith">starts with</option>
          <option value="endsWith">ends with</option>
        </select>
          
        {/* Value */}
        {!['platform', 'type', 'status'].includes(selectedFieldDropdown) && (
          <input
            className="w-full text-white bg-gray-900 border border-gray-600 text-sm mb-4"
            value={inputValue}
            placeholder={valuePlaceholder}
            onChange={(event) => setInputValue(event.target.value)}
          />
        )}
        {selectedFieldDropdown === 'platform' && (
          <select
            className="w-full text-white bg-gray-900 border border-gray-600 text-sm mb-4"
            value={inputValue}
            onChange={(event) => setInputValue(event.target.value)}
          >
            <option value="directory">directory</option>
            <option value="email">email</option>
            <option value="github">github</option>
            <option value="google">google</option>
            <option value="slack">slack</option>
          </select>
        )}
        {selectedFieldDropdown === 'type' && (
          <select
            className="w-full text-white bg-gray-900 border border-gray-600 text-sm mb-4"
            value={inputValue}
            onChange={(event) => setInputValue(event.target.value)}
          >
            <option value="participant">participant</option>
            <option value="record">record</option>
            <option value="activity">activity</option>
            <option value="account">account</option>
            <option value="workspace">workspace</option>
            <option value="organization">organization</option>
            <option value="orgunit">orgunit</option>
            <option value="group">group</option>
            <option value="role">role</option>
            <option value="team">team</option>
            <option value="repo">repo</option>
            <option value="channel">channel</option>
          </select>
        )}
        {selectedFieldDropdown === 'status' && (
          <select
            className="w-full text-white bg-gray-900 border border-gray-600 text-sm mb-4"
            value={inputValue}
            onChange={(event) => setInputValue(event.target.value)}
          >
            <option value="active">active</option>
            <option value="suspended">suspended</option>
          </select>
        )}

        <div className="flex gap-4 items-center w-full">
          <Button label={saveLabel} click={handleSave} className="w-full" />
          <Button label="Cancel" type="outline" click={onCancel} className="w-full" />
        </div>
      </div>
    </Bubble>
  )
}
