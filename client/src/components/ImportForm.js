import React, { useState } from 'react';
import Button from '../components/Button';

export default function ImportForm ({
  submitSuccess,
}) {
  const [file, setFile] = useState(null);
  const [errors, setErrors] = useState([]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:3001/import-csv', {
        method: 'POST',
        enctype: "multipart/form-data",
        body: formData,
      });

      if (response.ok) {
        submitSuccess();
      } else {
        const errorData = await response.json(); // Parse the response body as JSON
        setErrors(errorData.errors); // Set the errors state
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex gap-3 items-center">
        <input type="file" id="file" name="file" accept="csv" onChange={handleFileChange} className="text-white flex-1 bg-gray-800 p-2 rounded-lg"></input>
        <Button label="Import" submit />
      </div>
      {errors.length > 0 &&
        <ul className="mt-6 text-red-500">
          {errors.map((error, index) => (
            <li key={index}>{error}</li>
          ))}
        </ul>
      }
    </form>
  )
}
