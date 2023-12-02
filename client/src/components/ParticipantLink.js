import React from 'react';
import Button from './Button'

// TODO: This component does not look like it's currently in use

export default function ParticipantLink({
  onSuccess,
  personaUpn,
  participantUpn
}) {
  const handleSubmit = async (e) => {
    e.preventDefault();

    const requestData = {
      personaUpn,
      participantUpn,
    };

    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/link-persona`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      });
      console.log(response)
      
      if (response.ok) {
        console.log('success')
        // onSuccess()
      } else {
        console.log('error')
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Button label="Link" className="" submit />
    </form>
  )
}