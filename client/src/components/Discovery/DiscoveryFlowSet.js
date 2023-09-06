import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLayerGroup } from '@fortawesome/free-solid-svg-icons';
import DiscoveryIconEdit from './DiscoveryIconEdit';
import DiscoveryIconDelete from './DiscoveryIconDelete';
import DiscoveryIconArrow from './DiscoveryIconArrow';
import DiscoveryAddSet from './DiscoveryAddSet';

export default function DiscoveryFlowSet({ filter, onDelete, onEdit }) {
  const [mode, setMode] = useState('view');
  const [isHovered, setIsHovered] = useState(false);

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
      <FontAwesomeIcon icon={faLayerGroup} className="text-indigo-600 mt-0.5 mr-2 float-left" />
      <p className="text-white text-sm">{`${filter.name}`}</p>
      <DiscoveryIconDelete show={isHovered} onClick={() => onDelete(filter.id)} />
      <DiscoveryIconEdit show={isHovered} onClick={() => handleOnEdit()} />
      <DiscoveryIconArrow />
      {mode === 'edit' && (
        <DiscoveryAddSet onSave={(item) => {handleOnSave(item)}} onCancel={() => setMode("view")} data={filter} />
      )}
    </div>
  )
}
