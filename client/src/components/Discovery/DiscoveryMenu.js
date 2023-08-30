import React, { useState } from 'react';
import { faEllipsis } from '@fortawesome/free-solid-svg-icons';
import Bubble from '../Bubble';
import Button from '../Button';
import OutsideClick from '../OutsideClick';
import DiscoveryMenuOpen from './DiscoveryMenuOpen';
import DiscoveryMenuDuplicate from './DiscoveryMenuDuplicate';
import DiscoveryMenuDelete from './DiscoveryMenuDelete';
import DiscoveryMenuSave from './DiscoveryMenuSave';

export default function DiscoveryMenu({ onSave, parentId, initialMode = '' }) {
  const [mode, setMode] = useState(initialMode);

  const toggleMenu = () => {
    if (mode === 'more') {
      setMode('');
    } else {
      setMode('more');
    }
  }

  const saveForm = (data) => {
    onSave(data, parentId);
    setMode('');
  }

  return (
    <div className="relative">
      <OutsideClick onClickOutside={() => { setMode('') }}>
        <div className="flex gap-2 py-1">
          <Button label="Save" click={ ()=>{ setMode('save') } } type="outline-small" />
          <Button icon={faEllipsis} type="outline-circle-small" click={() => { toggleMenu() }} />
        </div>
        {mode === 'more' && (
          <Bubble size="small" className="absolute top-16 right-0 z-10">
            <Button label="Open" type="link" click={() => { setMode('open') }} />
            <Button label="Duplicate" type="link" click={() => { setMode('duplicate') }} />
            <Button label="Delete" type="link" click={() => { setMode('delete') }} />
          </Bubble>
        )}
        {mode === 'open' && (
          <DiscoveryMenuOpen onSave={saveForm} onCancel={() => setMode("")} />
          )}
        {mode === 'duplicate' && (
          <DiscoveryMenuDuplicate onSave={saveForm} onCancel={() => setMode("")} />
        )}
        {mode === 'delete' && (
          <DiscoveryMenuDelete onSave={saveForm} onCancel={() => setMode("")} />
        )}
        {mode === 'save' && (
          <DiscoveryMenuSave onSave={saveForm} onCancel={() => setMode("")} />
        )}
      </OutsideClick>
    </div>
  )
}
