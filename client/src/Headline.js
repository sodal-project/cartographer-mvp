import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

export default function Headline({
  icon,
  children
}) {
  return (
    <div className="flex flex-1 py-2">
      {icon && (
        <div className='text-white mr-3'>
          <FontAwesomeIcon icon={icon} size="xl" />
        </div>
      )}
      <h1 className="text-2xl font-semibold leading-6 text-white">{children}</h1>
    </div>
  )
}