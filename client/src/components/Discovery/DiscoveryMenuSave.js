import React, {useState} from 'react';
import Bubble from '../Bubble';
import Button from '../Button';

export default function DiscoveryMenuSave({
  onSave,
  onCancel,
}) {  
  const [nameField, setNameField] = useState('');

  const saveSet = () => {
    const data = {
      name: nameField
    }
    onSave(data)
  }

  return (
    <Bubble title="Save Set" pointPosition="rightish" className="absolute top-16 right-0 z-10">
      <div className='w-full flex flex-col gap-4'>
        <input
          className={`w-full text-white bg-gray-900 border border-gray-600 text-sm`}
          value={nameField}
          onChange={(event) => setNameField(event.target.value)}
        />
        <div className="flex gap-4 items-center w-full">
          <Button className="flex-1" label="Save" click={saveSet} />
          <Button className="flex-1" label="Cancel" type="outline" click={onCancel} />
        </div>
      </div>
    </Bubble>
  )
}
