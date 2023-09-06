import React, { useState } from 'react';
import { faEllipsis } from '@fortawesome/free-solid-svg-icons';
import Bubble from '../Bubble';
import Button from '../Button';
import OutsideClick from '../OutsideClick';
import DiscoveryMenuOpen from './DiscoveryMenuOpen';
import DiscoveryMenuDuplicate from './DiscoveryMenuDuplicate';
import DiscoveryMenuDelete from './DiscoveryMenuDelete';
import DiscoveryMenuSave from './DiscoveryMenuSave';
import DiscoveryMenuExport from './DiscoveryMenuExport';

export default function DiscoveryMenu({
  onSaveSet,
  onDeleteSet,
  onOpenSet,
  onClearSet,
  onExport,
  currentSetName,
  currentSetId
}) {
  const [mode, setMode] = useState('');

  const toggleMenu = () => {
    if (mode === 'more') {
      setMode('')
    } else {
      setMode('more')
    }
  }

  const handleOpen = (data) => {
    setMode('')
    onOpenSet(data)
  }
  const handleExport = (type) => {
    setMode('')
    onExport(type)
  }
  const handleDuplicate = (data) => {
    setMode('')
    onSaveSet(data)
  }
  const handleDelete = (id) => {
    setMode('')
    onDeleteSet(id)
  }
  const handleClear = () => {
    setMode('')
    onClearSet()
  }
  const handleSave = (data) => {
    setMode('')
    onSaveSet(data)
  }
  const handleSaveToggle = () => {
    if (currentSetName) {
      onSaveSet({
        name: currentSetName,
        setid: currentSetId
      })
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
            <Button label="Export" type="link" click={() => { setMode('export') }} />
            {currentSetName && (
              <>
                <Button label="Duplicate" type="link" click={() => { setMode('duplicate') }} />
                <Button label="Delete" type="link" click={() => { setMode('delete') }} />
                <Button label="Clear" type="link" click={handleClear} />
              </>
            )}
            {!currentSetName && (
              <>
                <span className="text-sm text-gray-500 cursor-default">Duplicate</span>
                <span className="text-sm text-gray-500 cursor-default">Delete</span>
                <span className="text-sm text-gray-500 cursor-default">Clear</span>
              </>
            )}
          </Bubble>
        )}
        {mode === 'open' && (
          <DiscoveryMenuOpen onOpen={handleOpen} onCancel={() => setMode("")} />
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
        {mode === 'export' && (
          <DiscoveryMenuExport onExport={handleExport} onCancel={() => setMode("")} />
        )}
      </OutsideClick>
    </div>
  )
}
