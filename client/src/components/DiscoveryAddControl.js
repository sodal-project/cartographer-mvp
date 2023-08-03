import React, { useState } from 'react';
import Bubble from './Bubble';
import Button from './Button';

export default function DiscoveryAddControl({
  onSave,
  cancel
}) {
  const [direction, setDirection] = useState('control');
  const [relationships, setRelationships] = useState([]);

  const relationshipList = [
    "Indirect",
    "Read",
    "Guest",
    "User",
    "Admin",
    "Superadmin",
    "System",
  ]

  const updateRelationships = (event) => {
    var updatedList = [...relationships];
    if (event.target.checked) {
      updatedList = [...relationships, event.target.value];
    } else {
      updatedList.splice(relationships.indexOf(event.target.value), 1);
    }
    setRelationships(updatedList);
  };
  
  const addItem = () => {
    onSave({
      type: 'filterControl',
      direction: direction,
      relationships: relationships,
      subset: []
    })
  }

  return (
    <Bubble title="Add Control" className="absolute top-16 left-1/2 -translate-x-1/2 z-10">
      <div className='w-full'>
        <select
          className="w-full text-white bg-gray-900 border border-gray-600 text-sm mb-4"
          value={direction}
          onChange={(event) => setDirection(event.target.value)}
        >
          <option value="control">Control</option>
          <option value="obey">Obey</option>
        </select>
        <div className="mb-4">
          {relationshipList.map((item, index) => (
            <div key={index} className='py-1'>
              <input value={item} type="checkbox" onChange={updateRelationships} />
              <span className="text-white ml-3 text-sm">{item}</span>
            </div>
          ))}
        </div>
        <div className="flex gap-4 items-center mx-auto">
          <Button className="flex-1" label="Add Control" click={addItem} />
          <Button className="flex-1" label="Cancel" type="outline" click={cancel} />
        </div>
      </div>
    </Bubble>
  )
}