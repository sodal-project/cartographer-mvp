import React, { useState } from 'react';
import { faPlus, faCaretDown, faLayerGroup, faFilter, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Button from './Button';
import DiscoveryAddFilter from './DiscoveryAddFilter';

const FlowBox = ({ type, label, onDelete }) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  return (
    <div
      className="relative bg-gray-900 border border-gray-600 rounded px-3 py-3 mb-6 hover:bg-indigo-600/20"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <FontAwesomeIcon icon={faFilter} className="text-indigo-600 mt-0.5 mr-2 float-left" />
      <p className="text-white text-sm">{label}</p>
      
      {/* Delete */}
      {isHovered && (
        <FontAwesomeIcon
          icon={faTrash}
          className="text-white absolute right-3 top-3 opacity-50 hover:opacity-100 cursor-pointer"
          onClick={onDelete}
        />
      )}
      
      {/* Arrow */}
      <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 h-5 text-gray-600">
        <div className="h-5 w-px bg-gray-600" />
        <FontAwesomeIcon icon={faCaretDown} size="lg" className="absolute top-2 -translate-x-1/2"/>
      </div>
    </div>
  )
}

export default function Discovery() {
  const [filters, setFilters] = useState([]);
  const [mode, setMode] = useState('view');

  const addItem = () => {
    if (mode === 'add') {
      setMode('view');
    } else {
      setMode('add');
    }
  }

  const deleteItem = (index) => {
    const newFilters = [...filters];
    newFilters.splice(index, 1);
    setFilters(newFilters);
  }

  const saveFilter = (data) => {
    setFilters([...filters, data])
    setMode('view')
    console.log('Filter Object', data)
  }

  const cancelAdd = () => {
    setMode('view')
  }

  return (
    <div>
      {filters.map((filter, index) => (
        <FlowBox label={`${filter.field} ${filter.operator} ${filter.value}`} key={index} onDelete={() => (deleteItem(index))} />
      ))}
      <div className="relative flex justify-center pt-3">
        <Button icon={faPlus} type="outline-circle-sm" click={() => { addItem() }} />

        {/* Add Item Menu */}
        {mode === 'add' && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 p-4 w-40 bg-gray-900 border border-gray-600 flex flex-col items-start gap-2">
            <Button label="Add Filter" type="link" click={() => { setMode('add-filter') }} />
            <Button label="Add Set" type="link" />
            <Button label="Add Control" type="link" />
            <Button label="Add match" type="link" />
          </div>
        )}

        {/* Add Filter UI */}
        {mode === 'add-filter' && (
          <DiscoveryAddFilter save={saveFilter} cancel={cancelAdd} />
        )}
      </div>
    </div>
  )
}
