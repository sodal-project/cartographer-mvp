import React, { useState } from 'react'; 
import Button from '../Button';
import InputText from '../InputText'

export default function FieldForm({ 
  upn,
  fieldLabel,
  fieldValue,
  onCancel,
  onSuccess
}) {
  const [formData, setFormData] = useState({
    upn: upn,
    fieldLabel: fieldLabel,
    fieldValue: fieldValue,
  });
  const [errors, setErrors] = useState([]);

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
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      if (response.ok) {
        onSuccess(formData.fieldLabel, formData.fieldValue)
      } else {
        const errorData = await response.json(); // Parse the response body as JSON
        setErrors(errorData.errors); // Set the errors state
      }
    } catch (error) {
      setErrors([...errors, error])
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {errors.length > 0 &&
        <ul className="mb-5 text-red-500">
          {errors.map((error, index) => (
            <li key={index}>{error}</li>
          ))}
        </ul>
      }
      <InputText
        name="fieldLabel"
        placeholder="Label"
        value={formData.fieldLabel}
        onChange={handleChange}
        className="mb-5"
        />
      <InputText
        name="fieldValue"
        placeholder="Value"
        value={formData.fieldValue}
        onChange={handleChange}
        className="mb-5"
      />
      <div className="flex gap-5 justify-center">
        <Button className="w-24" label="Save" submit />
        <Button click={onCancel} className="w-24" type="outline" label="Cancel" />
      </div>
    </form>
  )
}