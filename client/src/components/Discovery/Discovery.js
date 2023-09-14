import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { findHighestId, removeAllIds, addUniqueIds, convertObjectArrayToCSV } from '../../util/util';
import copy from 'copy-to-clipboard';
import DiscoveryMenu from './DiscoveryMenu';
import DiscoveryAdd from './DiscoveryAdd';
import DiscoveryFlowField from './DiscoveryFlowField';
import DiscoveryFlowControl from './DiscoveryFlowControl';
import DiscoveryFlowMatch from './DiscoveryFlowMatch';
import DiscoveryFlowSet from './DiscoveryFlowSet';

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
      subset: removeAllIds(filters)
    };

    if (data.setid) {
      requestData.setid = data.setid
    }
    try {
      const response = await fetch('http://localhost:3001/discoveryset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      });
      
      if (response.ok) {
        const responseBody = await response.json()
        const newId = Number(responseBody.setid)
        setCurrentSetName(data.name)
        setCurrentSetId(newId)

        // If we don't have ids on filters after save add them
        if (!filters[0]?.id) {
          setFilters(addUniqueIds(filters))
        }
        toast.success(`Set "${data.name}" Saved`)
      } else {
        console.log('error')
        // const errorData = await response.json(); // Parse the response body as JSON
        // setErrors(errorData.errors); // Set the errors state
      }
    } catch (error) {
      console.error(error);
    }
  };

  const onOpenSet = async (data) => {
    setCurrentSetId(data.setid)
    setCurrentSetName(data.name)
    setFilters(data.subset)
  }
  
  const onClearSet = () => {  
    setFilters([])
    setCurrentSetName(null)
    setCurrentSetId(null)
  };

  const onDeleteSet = async (setid) => {  
    fetch(`http://localhost:3001/discoveryset/${setid}`, {
      method: 'DELETE'
    })  
    .then((response) => {
      if (response.ok) {
        onClearSet()
      } else {
        console.error('Error deleting item');
      }
    })
    .catch((error) => {
      console.error('Error:', error);
    })
  };

  const onExport = async (type) => {
    let csv
    
    const requestBody = {
      page: 1,
      pageSize: 50000,
    };

    if (filters?.length > 0) {
      requestBody.filterQuery = JSON.stringify(filters);
    }

    try {
      const response = await fetch('http://localhost:3001/personas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json', // Set the content type to JSON
        },
        body: JSON.stringify(requestBody), // Convert the request body to JSON
      });

      if (!response.ok) {
        throw new Error(`HTTP Error! Status: ${response.status}`);
      }

      const body = await response.json();
      const records = body.records;
      if (records?.length > 0){
        const personas = records.map(node => node._fields[0].properties);
        csv = convertObjectArrayToCSV(personas)
      }
    } catch (error) {
      console.error(error);
    }
    
    if (type === 'clipboard') {
      copy(csv);
    } else {
      download(csv)
    }
  };

  const download = async (csv) => {
    // Send the CSV string to the server
    const response = await fetch('http://localhost:3001/download-csv', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ csv }),
    });

    // Check if the response is successful and initiate the download
    if (response.ok) {
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'cartographer-export.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } else {
      console.error('Failed to download CSV');
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
        <DiscoveryMenu onSaveSet={onSaveSet} onOpenSet={onOpenSet} onDeleteSet={onDeleteSet} onClearSet={onClearSet} onExport={onExport} currentSetName={currentSetName} currentSetId={currentSetId} />
      </div>
      {filters?.map((filter, index) => {
        if (filter.type === "filterControl") {
          return <DiscoveryFlowControl filter={filter} key={index} onDelete={onDelete} onSave={onSave} onEdit={onEdit} />
        } else if (filter.type === "filterMatch") {
          return <DiscoveryFlowMatch filter={filter} key={index} onDelete={onDelete} onSave={onSave} onEdit={onEdit} />
        } else if (filter.type === "filterSet") {
          return <DiscoveryFlowSet filter={filter} key={index} onDelete={onDelete} onSave={onSave} onEdit={onEdit} />
        }
        return <DiscoveryFlowField filter={filter} key={index} onDelete={onDelete} onEdit={onEdit} />
      })}
      <DiscoveryAdd onSave={onSave} parentId={null} />
      {/* <pre>
        <code className='text-white text-sm'>
        {JSON.stringify(filters, undefined, 2)}
        </code>
      </pre> */}
    </div>
  )
}
