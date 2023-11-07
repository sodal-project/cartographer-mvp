import React, { useState } from 'react';
import Button from '../Button'
import InputText from '../InputText'

export default function ParticipantForm({
  upn,
  firstName = '',
  lastName = '',
  handle = '',
  onCancel,
  onSuccess
}) {
  const [formData, setFormData] = useState({
    firstName: firstName,
    lastName: lastName,
    handle: handle,
  });
  const [errors, setErrors] = useState([]);
  
  if (upn) {
    formData.upn = upn;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/persona`, {
        method: upn ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      if (response.ok) {
        onSuccess()
      } else {
        const errorData = await response.json(); // Parse the response body as JSON
        setErrors(errorData.errors); // Set the errors state
      }
    } catch (error) {
      setErrors([...errors, error])
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
        <InputText
          name="firstName"
          placeholder="First Name"
          value={formData.firstName}
          onChange={handleChange}
        />
        <InputText
          name="lastName"
          placeholder="Last Name"
          value={formData.lastName}
          onChange={handleChange}
        />
        <InputText
          name="handle"
          placeholder="Handle"
          value={formData.handle}
          onChange={handleChange}
        />
        <div className="flex gap-4">
          <Button label="Save" className="w-1/2" submit />
          <Button label="Cancel" className="w-1/2" type="outline" click={onCancel} />
        </div>
      </div>
    </form>
  )
}