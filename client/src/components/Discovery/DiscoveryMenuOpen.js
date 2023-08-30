import React, { useState } from 'react';
import Bubble from '../Bubble';
import Button from '../Button';

export default function DiscoveryMenuOpen({
  onSave,
  onCancel,
  data = {}
}) {
  const [direction, setDirection] = useState(data.direction || 'control' );
  
  const open = () => {
    console.log("Open")
  }

  return (
    <Bubble title="Open Set" pointPosition="right" className="absolute top-16 right-0 z-10">
      <div className='w-full'>
        <select
          className="w-full text-white bg-gray-900 border border-gray-600 rounded text-sm mb-4"
          value={direction}
          onChange={(event) => setDirection(event.target.value)}
        >
          <option value="control">Control</option>
          <option value="obey">Obey</option>
          <option value="notcontrol">Does Not Control</option>
          <option value="notobey">Does Not Obey</option>
        </select>
        <div className="flex gap-4 items-center mx-auto">
          <Button className="flex-1" label="Open" click={open} />
          <Button className="flex-1" label="Cancel" type="outline" click={onCancel} />
        </div>
      </div>
    </Bubble>
  )
}
