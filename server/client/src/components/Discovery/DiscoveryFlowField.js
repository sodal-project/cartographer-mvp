import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilter } from '@fortawesome/free-solid-svg-icons';
import DiscoveryIconEdit from './DiscoveryIconEdit';
import DiscoveryIconDelete from './DiscoveryIconDelete';
import DiscoveryIconArrow from './DiscoveryIconArrow';
import DiscoveryAddFilter from './DiscoveryAddFilter';

export default function DiscoveryFlowField({ filter, onDelete, onEdit }) {
  const [mode, setMode] = useState('view');
  const [isHovered, setIsHovered] = useState(false);
  const operators = {
    "=": "=",
    "≠": "≠",
    ">": ">",
    "<": "<",
    ">=": ">=",
    "<=": "<=",
    "contains": "contains",
    "startsWith": "starts with",
    "endsWith": "ends with",
  }

  const handleOnEdit = () => {
    const newMode = (mode === 'edit') ? 'view' : 'edit'
    setMode(newMode)
  }

  const handleOnSave = (item) => {
    const newFilter = {...filter, ...item}
    onEdit(newFilter)
    setMode('view')
  }

  return (
    <div
      onMouseEnter={() => setIsHovered(true)} onMouseLeave={ () => setIsHovered(false)}
      className="relative bg-gray-900 border border-gray-600 rounded-md px-3 py-3 mb-6"
    >
      <FontAwesomeIcon icon={faFilter} className="text-indigo-600 mt-0.5 mr-2 float-left" />
      <p className="text-white text-sm">{`${filter.name} ${operators[filter.operator]} ${filter.value}`}</p>
      <DiscoveryIconDelete show={isHovered} onClick={() => onDelete(filter.id)} />
      <DiscoveryIconEdit show={isHovered} onClick={() => handleOnEdit()} />
      <DiscoveryIconArrow />
      {mode === 'edit' && (
        <DiscoveryAddFilter onSave={(item) => {handleOnSave(item)}} onCancel={() => setMode("view")} data={filter} />
      )}
    </div>
  )
}
