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
    <div className="flex-1 w-full mb-5">
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
          className="block w-full rounded-md border-0 bg-white/5 p-2.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
        />
      </div>
    </div>
  )
}


export default function IntegrationForm ({
  submitSuccess,
  cancelClick,
  data = {},
}) {
  const [file, setFile] = useState(null);
  const [formFields, setFormFields] = useState({
    id: data.id || '',
    type: data.type || 'aws',
    name: data.name || '',
    accessKeyId: data.accessKeyId || '',
    secretAccessKey: data.secretAccessKey || '',
    token: data.token || '',
    teamId: data.teamId || '',
    customer: data.customer || '',
    subjectEmail: data.subjectEmail || '',
    workspaceName: data.workspaceName || '',
  });
  const [errors, setErrors] = useState([]);

  const handleTypeChange = (e) => {
    if (e.target.value !== 'google') {
      setFile(null);
    }
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

    if (formFields.type === 'aws') {
      formData.append('accessKeyId', formFields.accessKeyId);
      formData.append('secretAccessKey', formFields.secretAccessKey);
    } else if (formFields.type === 'csv') {
      formData.append('file', file);
    } else if (formFields.type === 'github') {
      formData.append('token', formFields.token);
    } else if (formFields.type === 'google') {
      formData.append('customer', formFields.customer);
      formData.append('subjectEmail', formFields.subjectEmail);
      formData.append('workspaceName', formFields.workspaceName);
      formData.append('file', file);
    } else if (formFields.type === 'heroku') {
      formData.append('apiKey', formFields.apiKey);
    } else if (formFields.type === 'slack') {
      formData.append('teamId', formFields.teamId);
      formData.append('token', formFields.token);
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/integration-add`, {
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
      <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur"></div>
      <div className="fixed top-20 left-1/2 -translate-x-1/2 w-full max-w-xl p-10 z-50 bg-gray-900 rounded-lg shadow-black shadow-xl">
        <div className="w-40 mb-5">
          <label htmlFor="type" className="block text-sm font-medium leading-6 text-white mb-2">
            Type
          </label>
          <select
            id="type"
            name="type"
            value={formFields.type} // Set the value to the state value
            onChange={handleTypeChange}
            className="block w-full rounded-md border-0 bg-white/5 py-2.5 px-3 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6 [&_*]:text-black"
          >
            <option value="aws">AWS</option>
            <option value="csv">CSV</option>
            <option value="github">Github</option>
            <option value="google">Google</option>
            <option value="heroku">Heroku </option>
            <option value="slack">Slack</option>
          </select>
        </div>
        <Field label="Name" value={formFields.name} name="name" handleChange={handleChange} />

        {formFields.type === "aws" && (
          <>
            <Field label="Access Key Id" value={formFields.accessKeyId} name="accessKeyId" handleChange={handleChange} />
            <Field label="Secret Access Key" value={formFields.secretAccessKey} name="secretAccessKey" handleChange={handleChange} />
          </>
        )}
        {formFields.type === "csv" && (
          <>
            <input type="file" id="file" name="file" accept="csv" onChange={handleFileChange} className="py-3 text-white w-80"></input>
          </>
        )}
        {formFields.type === "github" && (
          <>
            <Field label="Token" value={formFields.token} name="token" handleChange={handleChange} />
          </>
        )}
        {formFields.type === "google" && (
          <>
            <Field label="Customer ID" value={formFields.customer} name="customer" handleChange={handleChange} />
            <Field label="Subject Email" value={formFields.subjectEmail} name="subjectEmail" handleChange={handleChange} />
            <Field label="Workspace Name" value={formFields.workspaceName} name="workspaceName" handleChange={handleChange} />
            <input type="file" id="file" name="file" accept="json" onChange={handleFileChange} className="py-3 text-white w-80"></input>
          </>
        )}
        {formFields.type === "heroku" && (
          <>
            <Field label="API Key" value={formFields.apiKey} name="apiKey" handleChange={handleChange} />
          </>
        )}
        {formFields.type === "slack" && (
          <>
            <Field label="Team ID" value={formFields.teamId} name="teamId" handleChange={handleChange} />
            <Field label="Token" value={formFields.token} name="token" handleChange={handleChange} />
          </>
        )}
        
        <input type="hidden" name="id" value={formFields.id} />
        <div className="flex gap-3 mt-8">
          <Button label="Save" submit />
          <Button label="Cancel" type="outline" click={cancelClick} />
        </div>
        {errors.length > 0 &&
          <ul className="mt-6 text-red-500">
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        }
      </div>
    </form>
  )
}
