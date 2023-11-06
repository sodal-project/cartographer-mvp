import React, { useState } from 'react';
import Bubble from '../Bubble';
import Button from '../Button';

export default function DiscoveryAddMatch({
  onSave,
  onCancel,
  data = {}
}) {
  const [direction, setDirection] = useState(data.direction || 'in' );
  const title = data.id ? 'Edit Match' : 'Add Match'
  const saveLabel = data.id ? 'Save' : 'Add Match'

  const addItem = () => {
    onSave({
      type: 'filterMatch',
      direction: direction,
      subset: []
    })
  }

  return (
    <Bubble title={title} className="absolute top-16 left-1/2 -translate-x-1/2 z-10">
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
          <Button className="flex-1" label={saveLabel} click={addItem} />
          <Button className="flex-1" label="Cancel" type="outline" click={onCancel} />
        </div>
      </div>
    </Bubble>
  )
}
