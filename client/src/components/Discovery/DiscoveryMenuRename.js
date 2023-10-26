import React, {useState} from 'react';
import Bubble from '../Bubble';
import Button from '../Button';

export default function DiscoveryMenuRename({
  onRename,
  onCancel,
  currentSetName
}) {
  const [name, setName] = useState(`${currentSetName}` || '');

  const renameSet = () => {
    onRename(name)
  }

  return (
    <Bubble title="Rename Set" pointPosition="right" className="absolute top-16 right-0 z-10">
      <div className='w-full flex flex-col gap-4'>
        <input
          className={`w-full text-white bg-gray-900 border border-gray-600 text-sm`}
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
        <div className="flex gap-4 items-center w-full">
          <Button className="flex-1" label="Rename" click={renameSet} />
          <Button className="flex-1" label="Cancel" type="outline" click={onCancel} />
        </div>
      </div>
    </Bubble>
  )
}
