import React, { useState } from 'react';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import Bubble from '../Bubble';
import Button from '../Button';
import OutsideClick from '../OutsideClick';
import DiscoveryAddControl from './DiscoveryAddControl';
import DiscoveryAddFilter from './DiscoveryAddFilter';
import DiscoveryAddMatch from './DiscoveryAddMatch';
import DiscoveryAddSet from './DiscoveryAddSet';

export default function DiscoveryAdd({ onSave, parentId, initialMode = '' }) {
  const [mode, setMode] = useState(initialMode);

  const addItem = () => {
    if (mode === 'add') {
      setMode('');
    } else {
      setMode('add');
    }
  }

  const handleSave = (data) => {
    onSave(data, parentId);
    setMode('');
  }

  return (
    <div className="relative flex justify-center pt-3">
      <OutsideClick onClickOutside={() => { setMode('') }}>
        <Button icon={faPlus} type="outline-circle-small" click={() => { addItem() }} />
        {mode === 'add' && (
          <Bubble size="small" className="absolute top-16 left-1/2 -translate-x-1/2 z-10">
            <Button label="Add Filter" type="link" click={() => { setMode('add-filter') }} />
            <Button label="Add Control" type="link" click={() => { setMode('add-control') }} />
            <Button label="Add Match" type="link" click={() => { setMode('add-match') }} />
            <Button label="Add Set" type="link" click={() => { setMode('add-set') }} />
          </Bubble>
        )}
        {mode === 'add-filter' && (
          <DiscoveryAddFilter onSave={handleSave} onCancel={() => setMode('')} />
        )}
        {mode === 'add-control' && (
          <DiscoveryAddControl onSave={handleSave} onCancel={() => setMode('')} />
        )}
        {mode === 'add-match' && (
          <DiscoveryAddMatch onSave={handleSave} onCancel={() => setMode('')} />
        )}
        {mode === 'add-set' && (
          <DiscoveryAddSet onSave={handleSave} onCancel={() => setMode('')} />
        )}
      </OutsideClick>
    </div>
  )
}
