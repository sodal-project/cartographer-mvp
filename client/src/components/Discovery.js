import React, { useEffect, useState } from 'react';
import { faPlus, faCaretDown, faCodeBranch, faFilter, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { findHighestId } from '../util/util';
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

  const directions = {
    control: "Control",
    obey: "Obey",
    notcontrol: "Not Control",
    notobey: "Not Obey"
  }

  return (
    <div
      className="relative bg-gray-900 border border-gray-600 rounded-md px-3 py-3 mt-12 mb-6"
    >
      <div onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}
        className="relative bg-gray-900 border border-gray-600 rounded-full mx-4 px-4 py-3 -mt-9 mb-6">
        <FontAwesomeIcon icon={faCodeBranch}
          className="text-indigo-600 mt-0.5 mr-2 float-left" />
        <p className="text-white text-sm whitespace-nowrap">{directions[filter.direction]}: {filter.relationships.join(", ")}</p>
        <FlowDelete show={isHovered} onClick={() => onDelete(filter.id)} />
      </div>
      <div className="text-white">
        {filter.subset?.map((item, index) => {
          if (item.type === "filterField") {
            return <FlowBoxField filter={item} key={index} onDelete={onDelete} />
          } else if (item.type === "filterControl") {
            return <FlowBoxControl filter={item} key={index} onDelete={onDelete} onSave={onSave} />
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
  const operators = {
    "=": "=",
    "≠": "≠",
    ">": ">",
    "<": "<",
    ">=": ">=",
    "<=": "<=",
    "contains": "contains",
    "startsWith": "starts with",
    "endsWith": "ends with",
  }

  return (
    <div
      onMouseEnter={() => setIsHovered(true)} onMouseLeave={ () => setIsHovered(false)}
      className="relative bg-gray-900 border border-gray-600 rounded-md px-3 py-3 mb-6"
    >
      <FontAwesomeIcon icon={faFilter} className="text-indigo-600 mt-0.5 mr-2 float-left" />
      <p className="text-white text-sm">{`${filter.name} ${operators[filter.operator]} ${filter.value}`}</p>
      <FlowDelete show={isHovered} onClick={() => onDelete(filter.id)} />
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

 
  const saveForm = (data, parentId) => {
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
          return <FlowBoxField filter={filter} key={index} onDelete={deleteItem} />
        } else if (filter.type === "filterControl") {
          return <FlowBoxControl filter={filter} key={index} onDelete={deleteItem} onSave={saveForm} />
        }
      })}
      <DiscoveryAdd onSave={saveForm} parentId={null} />
    </div>
  )
}
