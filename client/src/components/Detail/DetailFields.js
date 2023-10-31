import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus } from '@fortawesome/free-solid-svg-icons'
import CustomFieldForm from '../Forms/CustomFieldForm';
import Modal from '../Modal';

export default function DetailFields ({
  persona,
  onFieldsUpdate
}) {
  const customProperties = personaCustomProperties(persona);
  const [showFieldForm, setShowFieldForm] = useState(false);
  
  function onFieldFormSuccess() {
    setShowFieldForm(false)
    onFieldsUpdate()
  }
  
  function onFieldFormCancel() {
    setShowFieldForm(false)
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
          <button onClick={() => { setShowFieldForm(true) }} className="border border-indigo-400 rounded-lg h-16 cursor-pointer flex items-center justify-center">
            <h4 className="text-white text-sm font-bold capitalize">
              <FontAwesomeIcon icon={faPlus} size="lg" className="mr-2" />
              Add Field
            </h4>
          </button>
        )}
      </div>

      {showFieldForm && (
        <Modal onClickOutside={() => {setShowFieldForm(false)}}>
          <div className="p-5">
            <h4 className="text-white font-bold text-center mb-5">Add Field</h4>
            <CustomFieldForm upn={persona.upn} onCancel={onFieldFormCancel} onSuccess={onFieldFormSuccess} />
          </div>
        </Modal>
      )}
    </>
  )
}