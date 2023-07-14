import React, { useState, useEffect, useCallback } from 'react';
import { faAddressBook } from '@fortawesome/free-regular-svg-icons';
import Table from '../components/Table';
import Pagination from '../components/Pagination';
import Button from '../components/Button';
import Headline from '../components/Headline';

export default function Directory() {
  const [personas, setPersonas] = useState([]);
  const [personaCount, setPersonaCount] = useState(0);
  const [perPage, setPerPage] = useState(100);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchData = useCallback(async () => {
    try {
      const response = await fetch(`http://localhost:3001/personas?page=${currentPage}&pageSize=${perPage}`);
      const nodes = await response.json();
      const personas = nodes.map(node => node.properties);
      setPersonas(personas);
    } catch (error) {
      console.error(error);
    }
  }, [currentPage, perPage]);

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const response = await fetch('http://localhost:3001/persona-count');
        const count = await response.json();
        setPersonaCount(count);
      } catch (error) {
        console.error(error);
      }
    };

    fetchCount();
  }, []);

  useEffect(() => {
    fetchData();
  }, [currentPage, perPage, fetchData]);

  const syncPersonas = () => {
    fetch('http://localhost:3001/integrations/sync')
      .then(response => {
        if (!response.ok) {
          throw new Error('Request failed');
        }
        console.log('sync complete');
        return
      })
      .catch(error => {
        console.error('Sync error', error);
      });
  }

  return (
    <div className="bg-gray-900">
      <div className="p-10 ">
        <div className="flex items-center mb-10">
          <Headline icon={faAddressBook}>Directory</Headline>
          <div className="flex-none">
            <Button label="Sync" click={syncPersonas} />
          </div>
        </div>
        <Table data={personas} />
      </div>
      <div className="fixed left-56 right-0 bottom-0 text-white py-6 px-10 bg-gray-900 border-t border-gray-700">
        <Pagination
          itemCount={personaCount}
          perPage={perPage}
          currentPage={currentPage}
          prevClick={() => { setCurrentPage(currentPage - 1) }}
          nextClick={() => { setCurrentPage(currentPage + 1) }}
          changePerPage={(e) => { setPerPage(e.target.value) }}
        />
      </div>
    </div>
  )
}