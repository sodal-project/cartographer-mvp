import React, { useState } from 'react';
import {faTrash} from '@fortawesome/free-solid-svg-icons'
import Button from './Button';

export default function ConfirmButton({
  click,
  submit = false,
  disabled = false,
}) {
  const [confirming, setConfirming] = useState(false);

  const handleConfirm = () => {
    setConfirming(false);
    click();
  }
  const handleCancel = () => {
    setConfirming(false);
  }
    
  return (
    <div>
      <Button type="link" icon={faTrash} disabled={disabled} click={() => { setConfirming(true)}} />
      <div className="relative">
        {confirming &&
          <div className="absolute -right-2 bottom-0 transform translate-y-0.5 flex gap-4 items-center bg-gray-900 border border-gray-700 rounded-full px-3 py-0.5 shadow-black/30 shadow-md">
            <Button type="link" label={`delete`} click={handleConfirm} submit={submit} />
            <div className="absolute w-px top-1 bottom-1 left-1/2 transfrom -translate-x-px bg-gray-700" />
            <Button type="link" label="cancel" click={handleCancel} />
          </div>
        }
      </div>
    </div>
  )
}