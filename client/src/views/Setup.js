import React from 'react';
import { faGear } from '@fortawesome/free-solid-svg-icons'
import Headline from '../components/Headline';

export default function Setup() {
  return (
    <div className="bg-gray-900 p-10">
      <Headline icon={faGear}>Setup</Headline>
    </div>
  )
}