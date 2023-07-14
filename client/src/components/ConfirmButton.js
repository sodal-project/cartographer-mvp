import React, { useState } from 'react';
import Button from './Button';

export default function ConfirmButton({
  label,
  click,
  type = 'solid',
  submit = false,
  disabled = false,
  icon = null
}) {
  const [confirming, setConfirming] = useState(false);

  return (
    <div className="relative">
      <Button type={type} label={label} icon={icon} disabled={disabled} click={() => { setConfirming(true)}} />
      {confirming &&
        <div className="absolute -right-2 top-1/2 transform -translate-y-1/2 flex gap-4 items-center bg-gray-900 border border-gray-700 rounded-full px-3 py-0.5 shadow-black/30 shadow-md">
          <Button type="link" label={`delete`} click={click} submit={submit} />
          <div className="absolute w-px top-1 bottom-1 left-1/2 transfrom -translate-x-px bg-gray-700" />
          <Button type="link" label="cancel" click={() => { setConfirming(false)}} />
        </div>
      }
    </div>
  )
}