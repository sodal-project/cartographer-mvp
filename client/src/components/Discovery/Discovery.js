import React, { useEffect, useState } from 'react';
import { findHighestId } from '../../util/util';
import DiscoveryMenu from './DiscoveryMenu';
import DiscoveryAdd from './DiscoveryAdd';
import DiscoveryFlowField from './DiscoveryFlowField';
import DiscoveryFlowControl from './DiscoveryFlowControl';
import DiscoveryFlowMatch from './DiscoveryFlowMatch';

const updateFilters = (filters, newFilter) => {
  return filters.map((filter, index) => {
    if (filter.id === newFilter.id) {
      // Match
      if (filter.type === "filterMatch") {
        let updatedMatch = { ...filter }
        updatedMatch.direction = newFilter.direction
        return updatedMatch
      }
      // Control
      if (filter.type === "filterControl") {
        let updatedControl = { ...filter }
        updatedControl.direction = newFilter.direction
        updatedControl.relationships = newFilter.relationships
        return updatedControl
      }
      // Field
      return newFilter;
    } else if (filter.subset) {
      return {
        ...filter,
        subset: updateFilters(filter.subset, newFilter)
      };
    } else {
      return filter;
    }
  });
}

export default function Discovery({onUpdate}) {
  const [filters, setFilters] = useState([]);
  const [currentSetName, setCurrentSetName] = useState(null);
  const [currentSetId, setCurrentSetId] = useState(null);

  useEffect(() => {
    onUpdate(filters)
  }, [filters])

  const onDelete = (id) => {
    const deleteFromFilters = (filters, id) => {
      return filters.filter((item) => {
        if (item.id === id) {
          return false;
        } else if (item.subset) {
          item.subset = deleteFromFilters(item.subset, id);
        }
        return true;
      });
    }
    const updatedFilters = deleteFromFilters(filters, id)
    setFilters([...updatedFilters])
  }
  
  const onEdit = (filter) => {
    const updatedFilters = updateFilters(filters, filter)
    setFilters(updatedFilters)
  }

  // TODO: rename to disambiguate from "onSaveSet"
  const onSave = (data, parentId) => {
    const highestId = findHighestId(filters);
    const updatedData = { ...data, id: highestId + 1 }

    const addToSubset = (filters, parentId, newFilter) => {
      const updatedFilters = [...filters]
      updatedFilters.forEach((filter) => {
        if (filter.id === parentId) {
          filter.subset = [...filter.subset, newFilter]
          return
        } else if (filter.subset !== undefined) {
          addToSubset(filter.subset, parentId, newFilter)
        }
      })
      return updatedFilters
    }

    if (parentId) {
      const updatedFilters = addToSubset(filters, parentId, updatedData)
      setFilters([...updatedFilters])
    } else {
      setFilters([...filters, updatedData])
    }
  }

  const onSaveSet = async (data) => {  
    const requestData = {
      name: data.name,
      query: filters
    };

    console.log(requestData)

    try {
      const response = await fetch('http://localhost:3001/discoveryset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      });
      
      if (response.ok) {
        console.log('success')
        setCurrentSetName(data.name)
        // Todo: get id from response
        setCurrentSetId(1)
      } else {
        console.log('error')
        // const errorData = await response.json(); // Parse the response body as JSON
        // setErrors(errorData.errors); // Set the errors state
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <div className='flex items-center gap-2 mb-6'>
        <div className="flex-1">
          <h1 className="text-xl text-white font-semibold leading-none">Discovery</h1>
          {currentSetName && (
            <span className="text-sm text-gray-400 leading-none">{currentSetName}</span>
          )}
        </div>
        <DiscoveryMenu onSaveSet={onSaveSet} currentSetName={currentSetName} currentSetId={currentSetId} />
      </div>
      {filters.map((filter, index) => {
        if (filter.type === "filterControl") {
          return <DiscoveryFlowControl filter={filter} key={index} onDelete={onDelete} onSave={onSave} onEdit={onEdit} />
        } else if (filter.type === "filterMatch") {
          return <DiscoveryFlowMatch filter={filter} key={index} onDelete={onDelete} onSave={onSave} onEdit={onEdit} />
        }
        return <DiscoveryFlowField filter={filter} key={index} onDelete={onDelete} onEdit={onEdit} />
      })}
      <DiscoveryAdd onSave={onSave} parentId={null} />
    </div>
  )
}
