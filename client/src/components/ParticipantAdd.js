import React, { useState } from 'react';
import Button from './Button'
import InputText from './InputText'

export default function ParticipantAdd({
  onCancel,
  onSuccess
}) {
  const [errors, setErrors] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const firstName = e.target[0].value; // Assuming the index matches the order in the form
    const lastName = e.target[1].value;
    const handle = e.target[2].value;
  
    const requestData = {
      firstName,
      lastName,
      handle
    };

    try {
      const response = await fetch('http://localhost:3001/persona', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      });
      console.log(response)
      
      if (response.ok) {
        console.log('success')
        onSuccess()
      } else {
        console.log('error')
        const errorData = await response.json(); // Parse the response body as JSON
        setErrors(errorData.errors); // Set the errors state
      }
    } catch (error) {
      console.log('catch')
      console.error(error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      {errors && (
        <div className="text-red-500 mt-1">
          {errors}
        </div>
      )}
      <div className="flex flex-col gap-4 mt-4 mb-5">
        <InputText placeholder="First Name" />
        <InputText placeholder="Last Name" />
        <InputText placeholder="Handle" />
        <div className="flex gap-4">
          <Button label="Save" className="w-1/2" submit />
          <Button label="Cancel" className="w-1/2" type="outline" click={onCancel} />
        </div>
      </div>
    </form>
  )
}