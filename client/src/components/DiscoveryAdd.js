import React, { useState } from 'react';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import Button from './Button';
import DiscoveryAddControl from './DiscoveryAddControl';
import DiscoveryAddFilter from './DiscoveryAddFilter';
import DiscoveryAddMatch from './DiscoveryAddMatch';

export default function DiscoveryAdd({ onSave, parentId, initialMode = 'view' }) {
  const [mode, setMode] = useState(initialMode);

  const addItem = () => {
    if (mode === 'add') {
      setMode('view');
    } else {
      setMode('add');
    }
  }

  const saveForm = (data) => {
    onSave(data, parentId);
    setMode('view');
  }

  return (
    <div className="relative flex justify-center pt-3">
      <Button icon={faPlus} type="outline-circle-sm" click={() => { addItem() }} />

      {/* Add Item Menu */}
      {mode === 'add' && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-10 p-4 w-40 bg-gray-900 border border-gray-600 flex flex-col items-start gap-2">
          <Button label="Add Filter" type="link" click={() => { setMode('add-filter') }} />
          <Button label="Add Control" type="link" click={() => { setMode('add-control') }} />
          <Button label="Add Match" type="link" click={() => { setMode('add-match') }} />
        </div>
      )}

      {/* Add Item UI */}
      {mode === 'add-filter' && (
        <DiscoveryAddFilter onSave={saveForm} onCancel={() => setMode("view")} />
      )}
      {mode === 'add-control' && (
        <DiscoveryAddControl onSave={saveForm} cancel={() => setMode("view")} />
      )}
      {mode === 'add-match' && (
        <DiscoveryAddMatch onSave={saveForm} cancel={() => setMode("view")} />
      )}
    </div>
  )
}
