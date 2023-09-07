import React, { useState, useEffect } from 'react';
import Bubble from '../Bubble';
import Button from '../Button';

export default function DiscoveryAddSet({
  onSave,
  onCancel,
  data = {}
}) {
  const [discoverySets, setDiscoverySets] = useState([
    { setid: '', name: "Loading..." },
  ]);
  const [currentSet, setCurrentSet] = useState(null);
  const title = data.id ? 'Edit Set' : 'Add Set'
  const saveLabel = data.id ? 'Save' : 'Add Set'
  
  useEffect(() => {
    fetchData();
  }, []);
  
  const fetchData = async () => {
    try {
      const response = await fetch('http://localhost:3001/discoverysets');
      const sets = await response.json();
      if (sets.length > 0) {
        sortSets(sets)
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

  const sortSets = (sets) => {
    sets.sort((a, b) => {
      const nameA = a.name.toUpperCase();
      const nameB = b.name.toUpperCase();
    
      if (nameA < nameB) {
        return -1;
      }
      if (nameA > nameB) {
        return 1;
      }
      return 0;
    });
    return sets
  }

  const handleSelect = (event) => {
    const newCurrentSet = discoverySets.find((set) => set.setid === Number(event.target.value));
    setCurrentSet(newCurrentSet);
  }

  const addItem = () => {
    onSave({
      type: 'filterSet',
      name: currentSet?.name,
      setid: currentSet?.setid
    })
  }

  return (
    <Bubble title={title} className="absolute top-16 left-1/2 -translate-x-1/2 z-10">
      <div className='w-full'>
        <select
          className="w-full text-white bg-gray-900 border border-gray-600 rounded text-sm mb-4"
          onChange={handleSelect}
        >
          {discoverySets.map((set) => (
            <option key={set.setid} value={set.setid}>{set.name}</option>
          ))}
        </select>
        <div className="flex gap-4 items-center mx-auto">
          <Button className="flex-1" label={saveLabel} click={addItem} />
          <Button className="flex-1" label="Cancel" type="outline" click={onCancel} />
        </div>
      </div>
    </Bubble>
  )
}
