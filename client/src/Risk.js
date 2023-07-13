import React from 'react';
import Headline from './Headline';
import { faChartLine } from '@fortawesome/free-solid-svg-icons'

export default function Risk() {
  return (
    <div className="bg-gray-900 p-10">
      <Headline icon={faChartLine}>Risk Analysis</Headline>
    </div>
  )
}