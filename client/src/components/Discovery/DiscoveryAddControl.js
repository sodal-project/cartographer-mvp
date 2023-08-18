import React, { useState } from 'react';
import Bubble from '../Bubble';
import Button from '../Button';

export default function DiscoveryAddControl({
  onSave,
  onCancel,
  data = {}
}) {
  const [direction, setDirection] = useState(data.direction || 'control' );
  const [relationships, setRelationships] = useState(data.relationships || []);
  const relationshipList = [
    "indirect",
    "read",
    "guest",
    "user",
    "admin",
    "superadmin",
    "system",
  ]
  const title = data.id ? 'Edit Control' : 'Add Control'
  const saveLabel = data.id ? 'Save' : 'Add Control'

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
    <Bubble title={title} className="absolute top-16 left-1/2 -translate-x-1/2 z-10">
      <div className='w-full'>
        <select
          className="w-full text-white bg-gray-900 border border-gray-600 text-sm mb-4"
          value={direction}
          onChange={(event) => setDirection(event.target.value)}
        >
          <option value="control">Control</option>
          <option value="obey">Obey</option>
          <option value="notcontrol">Does Not Control</option>
          <option value="notobey">Does Not Obey</option>
        </select>
        <div className="mb-4">
          {relationshipList.map((item, index) => (
            <div key={index} className='py-1'>
              <input value={item} type="checkbox" checked={relationships.includes(item)} onChange={updateRelationships} />
              <span className="text-white ml-3 text-sm">{item}</span>
            </div>
          ))}
        </div>
        <div className="flex gap-4 items-center mx-auto">
          <Button className="flex-1" label={saveLabel} click={addItem} />
          <Button className="flex-1" label="Cancel" type="outline" click={onCancel} />
        </div>
      </div>
    </Bubble>
  )
}
