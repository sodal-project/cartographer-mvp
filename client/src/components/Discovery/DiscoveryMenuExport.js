import React from 'react';
import Bubble from '../Bubble';
import Button from '../Button';

export default function DiscoveryMenuExport({
  onCancel,
  onExport,
}) {  
  return (
    <Bubble title="Export Results" pointPosition="right" className="absolute top-16 right-0 z-10">
      <div className='w-full'>
        <p className="text-white text-sm">Export the current results to a file or</p>
        <Button type="link" label="Copy to Clipboard" click={() => onExport('clipboard')} />
        <div className="flex gap-4 items-center mx-auto mt-4">
          <Button className="flex-1" label="Download File" click={() => onExport('file')} />
          <Button className="flex-1" label="Cancel" type="outline" click={onCancel} />
        </div>
      </div>
    </Bubble>
  )
}
