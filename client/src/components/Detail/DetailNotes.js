import { useState } from 'react';
import Button from "../Button"
export default function DetailNotes({
  upn,
  fieldValue,
}) {
  const [savedValue, setSavedValue] = useState(fieldValue || '')
  const [formData, setFormData] = useState({
    upn: upn,
    fieldLabel: 'notes',
    fieldValue: fieldValue || '',
  });
  
  const handleSubmit = async (event) => {
    event.preventDefault();
    console.log(formData)
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/persona`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      if (response.ok) {
        setSavedValue(formData.fieldValue)
      } else {
        const errorData = await response.json();
        console.log(`Error: ${errorData.errors}`)
      }
    } catch (error) {
      console.log(error)
    }
  };

  const onChange = (e) => {
    const value = e.target.value
    const newFormData = { ...formData, fieldValue: value }
    setFormData(newFormData)
  }

  return (
    <div className="w-1/3">
      <div className="relative">
        <form onSubmit={handleSubmit}>
          <textarea
            className="rounded-lg border border-gray-600 h-56 w-full p-3 pt-10 bg-gray-900 text-sm text-white resize-none"
            onChange={onChange}
            defaultValue={fieldValue}
          />
          <div className={`absolute z-10 top-2 right-2 transition-opacity ${(formData.fieldValue !== savedValue) ? 'opacity-1' : 'opacity-0 pointer-events-none'}`}>
            <Button label="Save Notes" type="small" submit />
          </div>
        </form>
        <h4 className="absolute top-px left-px right-3 p-3 pb-2 rounded-lg bg-gray-900 text-white text-sm font-bold">Notes</h4>
      </div>
    </div>
  )
}
