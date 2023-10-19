import React from 'react';
import { faChartLine } from '@fortawesome/free-solid-svg-icons'
import Headline from '../components/Headline';

export default function Risk() {
  return (
    <div className="bg-gray-900 p-10">
      <Headline icon={faChartLine}>Risk Analysis</Headline>
    </div>
  )
}