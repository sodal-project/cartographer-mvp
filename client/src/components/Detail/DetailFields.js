import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus } from '@fortawesome/free-solid-svg-icons'
import Button from '../Button';
import InputText from '../InputText'
import Modal from '../Modal';

export default function DetailFields ({
  persona
}) {
  const customProperties = personaCustomProperties(persona);
  const [showAddField, setShowAddField] = useState(false);

  const submitAddField = async (e) => {
    e.preventDefault();

    const upn = e.target.field_label.upn;
    const fieldLabel = e.target.field_label.value;
    const fieldValue = e.target.field_value.value;

    const requestData = {
      upn,
      fieldLabel,
      fieldValue,
    }

    console.log('submit add field', requestData)

    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/persona`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      });
      console.log(response)

      if (response.ok) {
        console.log('success')
        setShowAddField(false)
      } else {
        console.log('error adding field')
        // const errorData = await response.json(); // Parse the response body as JSON
        // setErrors(errorData.errors); // Set the errors state
      }
    } catch (error) {
      console.log('catch')
      console.error(error);
    }
  }

  function personaCustomProperties(persona) {
    const keysToFilterOut = [
      "displayName",
      "firstName",
      "friendlyName",
      "githubDescription",
      "handle",
      "id",
      "lastVerified",
      "lastName",
      "name",
      "platform",
      "realName",
      "status",
      "type",
      "upn",
    ];

    const filteredProperties = Object.entries(persona).reduce((accumulator, [key, value]) => {
      if (!keysToFilterOut.includes(key)) {
        accumulator[key] = value;
      }
      return accumulator;
    }, {});
    const filteredPropertiesArray = Object.keys(filteredProperties).map(key => ({ key: key, value: filteredProperties[key] }));

    return filteredPropertiesArray;
  }

  return (
    <>
      <div className="grid grid-cols-3 gap-2">
        {customProperties
          .filter((item) => item.key && item.value)
          .map((item, index) => (
            <div className="bg-gray-800 px-4 py-2 rounded-lg h-16" key={index}>
              <h4 className="mt-0.5 text-gray-400 text-sm capitalize">{item.key}</h4>
              <div className="mt-1 text-white text-sm font-bold overflow-hidden text-ellipsis overflow-hidden">
                {item.value}
              </div>
            </div>
          ))
        }
        {persona.type === "participant" && (
          <a onClick={() => { setShowAddField(true) }} className="border border-indigo-400 rounded-lg h-16 cursor-pointer flex items-center justify-center">
            <h4 className="text-white text-sm font-bold capitalize">
              <FontAwesomeIcon icon={faPlus} size="lg" className="mr-2" />
              Add Field
            </h4>
          </a>
        )}
      </div>

      {showAddField && (
        <Modal onClickOutside={() => {setShowAddField(false)}}>
          <div className="p-5">
            <h4 className="text-white font-bold text-center mb-5">Add Field</h4>
            <form onSubmit={submitAddField}>
              <input name="upn" type="hidden" value={persona.upn} />
              <input name="field_label" placeholder="Label" className="mb-5 w-full text-white bg-gray-900 border border-gray-600 text-sm" />
              <input name="field_value" placeholder="Value" className="mb-5 w-full text-white bg-gray-900 border border-gray-600 text-sm"  />
              <div className="flex gap-5 justify-center">
                <Button className="w-24" label="Add Field" submit />
                <Button click={() => { setShowAddField(false) }} className="w-24" type="outline" label="Cancel" />
              </div>
            </form>
          </div>
        </Modal>
      )}
    </>
  )
}