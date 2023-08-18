import React, { useEffect, useState } from 'react';
import { findHighestId } from '../util/util';
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

  useEffect(() => {
    onUpdate(filters)
  }, [filters])

  const deleteItem = (id) => {
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

  return (
    <div>
      {filters.map((filter, index) => {
        if (filter.type === "filterField") {
          return <DiscoveryFlowField filter={filter} key={index} onDelete={deleteItem} onEdit={onEdit} />
        } else if (filter.type === "filterControl") {
          return <DiscoveryFlowControl filter={filter} key={index} onDelete={deleteItem} onSave={onSave} onEdit={onEdit} />
        } else if (filter.type === "filterMatch") {
          return <DiscoveryFlowMatch filter={filter} key={index} onDelete={deleteItem} onSave={onSave} onEdit={onEdit} />
        }
      })}
      <DiscoveryAdd onSave={onSave} parentId={null} />
    </div>
  )
}
