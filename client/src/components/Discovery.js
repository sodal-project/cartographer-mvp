import React, { useEffect, useState } from 'react';
import { faPlus, faCaretDown, faCodeBranch, faFilter, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { findHighestId, filterById } from '../util/util';
import Button from './Button';
import DiscoveryAddControl from './DiscoveryAddControl';
import DiscoveryAddFilter from './DiscoveryAddFilter';
import DiscoveryAddMatch from './DiscoveryAddMatch';

const FlowArrow = () => {
  return (
    <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 h-5 text-gray-600">
      <div className="h-5 w-px bg-gray-600" />
      <FontAwesomeIcon icon={faCaretDown} size="lg" className="absolute top-2 -translate-x-1/2" />
    </div>
  )
}

const FlowDelete = ({ onClick, show = true }) => {
  return (
    <>
      {show && (
        <FontAwesomeIcon icon={faTrash} onClick={onClick}
          className="text-white absolute right-3 top-3 opacity-50 hover:opacity-100 cursor-pointer" />
      )}
    </>
  )
}

const FlowBoxControl = ({ filter, onDelete, onSave }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="relative bg-gray-900 border border-gray-600 rounded-md px-3 py-3 mt-12 mb-6"
    >
      <div onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}
        className="relative bg-gray-900 border border-gray-600 rounded-full mx-4 px-4 py-3 -mt-9 mb-6">
        <FontAwesomeIcon icon={faCodeBranch}
          className="text-indigo-600 mt-0.5 mr-2 float-left" />
        <p className="text-white text-sm whitespace-nowrap">{filter.direction}: {filter.relationships.join(", ")}</p>
        <FlowDelete show={isHovered} onClick={onDelete} />
      </div>
      <div className="text-white">
        {filter.subset?.map((item, index) => {
          if (item.type === "filterField") {
            return <FlowBoxField filter={item} key={index} onDelete={() => {}} />
          } else if (item.type === "filterControl") {
            return <FlowBoxControl filter={item} key={index} onDelete={() => {}} onSave={onSave} />
          }
        })}
      </div>
      <DiscoveryAdd onSave={onSave} parentId={filter.id} />
      <FlowArrow />
    </div>
  )
}

const FlowBoxField = ({ filter, onDelete }) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleDelete = () => {
    console.log('handle delete')
    onDelete()
  }

  return (
    <div
      onMouseEnter={() => setIsHovered(true)} onMouseLeave={ () => setIsHovered(false)}
      className="relative bg-gray-900 border border-gray-600 rounded-md px-3 py-3 mb-6"
    >
      <FontAwesomeIcon icon={faFilter} className="text-indigo-600 mt-0.5 mr-2 float-left" />
      <p className="text-white text-sm">{`${filter.field} ${filter.operator} ${filter.value}`}</p>
      <FlowDelete show={isHovered} onClick={handleDelete} />
      <FlowArrow />
    </div>
  )
}

const FlowBoxMatch = ({ filter, onDelete }) => {
}

const DiscoveryAdd = ({ onSave, parentId }) => {
  const [mode, setMode] = useState('view');

  const addItem = () => {
    if (mode === 'add') {
      setMode('view');
    } else {
      setMode('add');
    }
  }

  const saveForm = (data) => {
    onSave(data, parentId);
    setMode('view');
  }

  return (
    <div className="relative flex justify-center pt-3">
      <Button icon={faPlus} type="outline-circle-sm" click={() => { addItem() }} />

      {/* Add Item Menu */}
      {mode === 'add' && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-10 p-4 w-40 bg-gray-900 border border-gray-600 flex flex-col items-start gap-2">
          <Button label="Add Filter" type="link" click={() => { setMode('add-filter') }} />
          <Button label="Add Control" type="link" click={() => { setMode('add-control') }} />
          <Button label="Add Match" type="link" click={() => { setMode('add-match') }} />
        </div>
      )}

      {/* Add Item UI */}
      {mode === 'add-filter' && (
        <DiscoveryAddFilter onSave={saveForm} cancel={() => setMode("view")} />
      )}
      {mode === 'add-control' && (
        <DiscoveryAddControl onSave={saveForm} cancel={() => setMode("view")} />
      )}
      {mode === 'add-match' && (
        <DiscoveryAddMatch onSave={saveForm} cancel={() => setMode("view")} />
      )}
    </div>
  )
}

export default function Discovery() {
  const [filters, setFilters] = useState([]);

  const deleteItem = (id) => {
    console.log('delete')
    const newFilters = filters.map(filter => filter.id !== id && filter);
    console.log(newFilters)
    setFilters(newFilters);
  }

  useEffect(() => {
    console.log('Filters', filters)
  }, [filters])

  const saveForm = (data, parentId) => {
    const highestId = findHighestId(filters);
    const updatedData = { ...data, id: highestId + 1 }
    if (parentId) {
      console.log('PARENT ID', parentId)
      const parent = filters.find((filter) => filter.id === parentId);
      // const parent = filterById(filters)
      console.log('PARENT', parent)
      const filtersWithoutParent = filters.filter((filter) => filter.id !== parentId);
      const updatedParent = {...parent, subset: [...parent.subset, updatedData]}
      setFilters([...filtersWithoutParent, updatedParent])
    } else {
      setFilters([...filters, updatedData])
    }
  }

  return (
    <div>
      {filters.map((filter, index) => {
        if (filter.type === "filterField") {
          return <FlowBoxField filter={filter} key={index} onDelete={() => (deleteItem(filter.id))} />
        } else if (filter.type === "filterControl") {
          return <FlowBoxControl filter={filter} key={index} onDelete={() => (deleteItem(filter.id))} onSave={saveForm} />
        }
      })}
      <DiscoveryAdd onSave={saveForm} parentId={null} />
    </div>
  )
}
