import React, { useState, useEffect } from 'react';
import Bubble from '../Bubble';
import Button from '../Button';

export default function DiscoveryMenuOpen({
  onOpen,
  onCancel
}) {
  const [discoverySets, setDiscoverySets] = useState([
    { id: '', name: "Loading..." },
  ]);
  const [currentSet, setCurrentSet] = useState(null);
  
  useEffect(() => {
    fetchData();
  }, []);
  
  const fetchData = async () => {
    try {
      const response = await fetch('http://localhost:3001/discoverysets');
      const sets = await response.json();
      if (sets.length > 0) {
        setDiscoverySets(sets);
        setCurrentSet(sets[0]);
      } else {
        setDiscoverySets([]);
        setCurrentSet(null);
      }
    } catch (error) {
      console.error(error);
    }
  };
  
  const handleSelect = (event) => {
    const newCurrentSet = discoverySets.find((set) => set.id === Number(event.target.value));
    setCurrentSet(newCurrentSet);
  }

  const handleOpen = () => {
    onOpen(currentSet);
  }

  return (
    <Bubble title="Open Set" pointPosition="right" className="absolute top-16 right-0 z-10">
      {discoverySets.length > 0 && (
        <div className='w-full'>
          <select
            className="w-full text-white bg-gray-900 border border-gray-600 rounded text-sm mb-4"
            onChange={handleSelect}
          >
            {discoverySets.map((set) => (
              <option key={set.id} value={set.id}>{set.name}</option>
            ))}
          </select>
          <div className="flex gap-4 items-center mx-auto">
            <Button className="flex-1" label="Open" click={() => handleOpen()} />
            <Button className="flex-1" label="Cancel" type="outline" click={onCancel} />
          </div>
        </div>
      )}
      {discoverySets.length === 0 && (
        <div className='w-full'>
          <p className="text-gray-400 text-sm">No saved sets found</p>
        </div>
      )}
    </Bubble>
  )
}