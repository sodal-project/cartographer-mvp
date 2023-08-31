import React, { useState } from 'react';
import { faEllipsis } from '@fortawesome/free-solid-svg-icons';
import Bubble from '../Bubble';
import Button from '../Button';
import OutsideClick from '../OutsideClick';
import DiscoveryMenuOpen from './DiscoveryMenuOpen';
import DiscoveryMenuDuplicate from './DiscoveryMenuDuplicate';
import DiscoveryMenuDelete from './DiscoveryMenuDelete';
import DiscoveryMenuSave from './DiscoveryMenuSave';

export default function DiscoveryMenu({
  onSaveSet,
  onDeleteSet,
  currentSetName,
  currentSetId
}) {
  const [mode, setMode] = useState('');

  const toggleMenu = () => {
    if (mode === 'more') {
      setMode('');
    } else {
      setMode('more');
    }
  }

  const handleOpen = (data) => {
    setMode('');
  }
  const handleDuplicate = (data) => {
    setMode('');
    onSaveSet(data);
  }
  const handleDelete = (id) => {
    setMode('');
    onDeleteSet(id)
  }
  const handleSave = (data) => {
    setMode('');
    onSaveSet(data);
  }
  const handleSaveToggle = () => {
    if (currentSetName) {
      onSaveSet({
        name: currentSetName,
        id: currentSetId
      });
      console.log('save current set (we are going to need the id)')
    } else {
      setMode('save')
    }
  }

  return (
    <div className="relative">
      <OutsideClick onClickOutside={() => { setMode('') }}>
        <div className="flex gap-2 py-1">
          <Button label="Save" click={ ()=>{ handleSaveToggle() } } type="outline-small" />
          <Button icon={faEllipsis} type="outline-circle-small" click={() => { toggleMenu() }} />
        </div>
        {mode === 'more' && (
          <Bubble size="small" pointPosition="right" className="absolute top-16 right-0 z-10">
            <Button label="Open" type="link" click={() => { setMode('open') }} />
            {currentSetName && (
              <>
                <Button label="Duplicate" type="link" click={() => { setMode('duplicate') }} />
                <Button label="Delete" type="link" click={() => { setMode('delete') }} />
              </>
            )}
            {!currentSetName && (
              <>
                <span className="text-sm text-gray-500 cursor-default">Duplicate</span>
                <span className="text-sm text-gray-500 cursor-default">Delete</span>
              </>
            )}
          </Bubble>
        )}
        {mode === 'open' && (
          <DiscoveryMenuOpen onSave={handleOpen} onCancel={() => setMode("")} />
          )}
        {mode === 'duplicate' && (
          <DiscoveryMenuDuplicate onSave={handleDuplicate} onCancel={() => setMode("")} currentSetName={currentSetName} />
        )}
        {mode === 'delete' && (
          <DiscoveryMenuDelete onDelete={handleDelete} onCancel={() => setMode("")} currentSetName={currentSetName} currentSetId={currentSetId} />
        )}
        {mode === 'save' && (
          <DiscoveryMenuSave onSave={handleSave} onCancel={() => setMode("")} />
        )}
      </OutsideClick>
    </div>
  )
}
