import React, { useState } from 'react';
import Button from '../components/Button';

const Field = ({
  label,
  name,
  value,
  handleChange
}) => {
  const id = label.toLowerCase().replace(' ', '-'); 
  return (
    <div className="flex-1">
      <label htmlFor={id} className="block text-sm font-medium leading-6 text-white">
        {label}
      </label>
      <div className="mt-2">
        <input
          type="text"
          name={name}
          id={id}
          defaultValue={value}
          onChange={handleChange}
          className="block w-full rounded-md border-0 bg-white/5 p-2 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
        />
      </div>
    </div>
  )
}


export default function IntegrationForm ({
  submitSuccess,
  cancelClick,
  name,
  token,
  type,
  id
}) {
  const [file, setFile] = useState(null);
  const [formFields, setFormFields] = useState({
    id: id || '',
    type: type || 'github', // Set the default value to "github"
    name: name || '',
    token: token || '',
  });
  const [errors, setErrors] = useState([]);

  const handleTypeChange = (e) => {
    setFormFields({
      ...formFields,
      name: '',
      token: '',
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };


  const handleChange = (e) => {
    setFormFields({
      ...formFields,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('id', formFields.id);
    formData.append('type', formFields.type);
    formData.append('name', formFields.name);
    formData.append('token', formFields.token);
    formData.append('keyfile', file);

    try {
      const response = await fetch('http://localhost:3001/add-integration', {
        method: 'POST',
        enctype: "multipart/form-data",
        body: formData,
      });

      if (response.ok) {
        submitSuccess();
      } else if (response.status === 400) {
        const errorData = await response.json(); // Parse the response body as JSON
        setErrors(errorData.errors); // Set the errors state
      } else {
        throw new Error('Request failed');
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex gap-4 w-full max-w-4xl items-end">
        <div className="w-28">
          <label htmlFor="type" className="block text-sm font-medium leading-6 text-white">
            Type
          </label>
          <div className="mt-2">
            <select
              id="type"
              name="type"
              value={formFields.type} // Set the value to the state value
              onChange={handleTypeChange}
              className="block w-full rounded-md border-0 bg-white/5 py-2.5 px-1 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6 [&_*]:text-black"
            >
              <option value="github">Github</option>
              <option value="google">Google</option>
            </select>
          </div>
        </div>

        {formFields.type === "github" && (
          <>
            <Field label="Name" value={formFields.name} name="name" handleChange={handleChange} />
            <Field label="Token" value={formFields.token} name="token" handleChange={handleChange} />
          </>
        )}
        {formFields.type === "google" && (
          <>
            <Field label="Customer ID" value={formFields.name} name="name" handleChange={handleChange} />
            <Field label="Key" value={formFields.token} name="token" handleChange={handleChange} />
            <input type="file" id="keyfile" name="keyfile" accept="json" onChange={handleFileChange}></input>
          </>
        )}
        
        <input type="hidden" name="id" value={formFields.id} />
        <div className="flex gap-3 mt-6">
          <Button label="Save" submit />
          <Button label="Cancel" type="outline" click={cancelClick} />
        </div>
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
