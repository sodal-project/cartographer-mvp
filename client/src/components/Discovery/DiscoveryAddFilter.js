import React, { useState } from 'react';
import Bubble from '../Bubble';
import Button from '../Button';

export default function DiscoveryAddFilter({
  onSave,
  onCancel,
  data = {}
}) {
  const [selectedField, setSelectedField] = useState(data.name || '');
  const [selectedFieldDropdown, setSelectedFieldDropdown] = useState(initialSelectField());
  const [selectedOperator, setSelectedOperator] = useState(data.operator || '=');
  const [inputValue, setInputValue] = useState(data.value || '');

  function initialSelectField() {
    const options = ["id","platform","type","status","upn","friendlyName","custom"]
    if (options.includes(data.name)) {
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

  const onSelectedFieldDropdownChange = (value) => {
    setSelectedFieldDropdown(value);
    if (value === 'custom') {
      setSelectedField('');
    } else {
      setSelectedField(value);
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
        <input
          className="w-full text-white bg-gray-900 border border-gray-600 text-sm mb-4"
          value={inputValue}
          onChange={(event) => setInputValue(event.target.value)}
        />
        
        <div className="flex gap-4 items-center w-full">
          <Button label={saveLabel} click={handleSave} className="w-full" />
          <Button label="Cancel" type="outline" click={onCancel} className="w-full" />
        </div>
      </div>
    </Bubble>
  )
}
