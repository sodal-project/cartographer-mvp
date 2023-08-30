import React, { useState } from 'react';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import Bubble from '../Bubble';
import Button from '../Button';
import OutsideClick from '../OutsideClick';
import DiscoveryAddControl from './DiscoveryAddControl';
import DiscoveryAddFilter from './DiscoveryAddFilter';
import DiscoveryAddMatch from './DiscoveryAddMatch';

export default function DiscoveryAdd({ onSave, parentId, initialMode = '' }) {
  const [mode, setMode] = useState(initialMode);

  const addItem = () => {
    if (mode === 'add') {
      setMode('');
    } else {
      setMode('add');
    }
  }

  const saveForm = (data) => {
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
          </Bubble>
        )}
        {mode === 'add-filter' && (
          <DiscoveryAddFilter onSave={saveForm} onCancel={() => setMode('')} />
        )}
        {mode === 'add-control' && (
          <DiscoveryAddControl onSave={saveForm} onCancel={() => setMode('')} />
        )}
        {mode === 'add-match' && (
          <DiscoveryAddMatch onSave={saveForm} onCancel={() => setMode('')} />
        )}
      </OutsideClick>
    </div>
  )
}
