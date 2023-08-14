import React, { useState } from 'react';
import Bubble from './Bubble';
import Button from './Button';

export default function DiscoveryAddMatch({
  onSave,
  cancel
}) {
  const [direction, setDirection] = useState('in');

  const addItem = () => {
    onSave({
      type: 'filterMatch',
      direction: direction,
      subset: []
    })
  }

  return (
    <Bubble title="Add Match" className="absolute top-16 left-1/2 -translate-x-1/2 z-10">
      <div className='w-full'>
        <select
          className="w-full text-white bg-gray-900 border border-gray-600 text-sm mb-4"
          value={direction}
          onChange={(event) => setDirection(event.target.value)}
        >
          <option value="in">Match In</option>
          <option value="notin">Match Not In</option>
        </select>
        <div className="flex gap-4 items-center mx-auto">
          <Button className="flex-1" label="Add Match" click={addItem} />
          <Button className="flex-1" label="Cancel" type="outline" click={cancel} />
        </div>
      </div>
    </Bubble>
  )
}