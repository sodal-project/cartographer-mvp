import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faPenToSquare, faTrash } from '@fortawesome/free-solid-svg-icons'
import CustomFieldForm from '../Forms/CustomFieldForm';
import Button from '../Button';
import Modal from '../Modal';

export default function DetailFields ({
  persona,
}) {
  const [customProperties, setCustomProperties] = useState([]);
  const [showFieldForm, setShowFieldForm] = useState(false);
  const [hoveredField, setHoveredField] = useState(null);
  const [formKey, setFormKey] = useState('');
  const [formValue, setFormValue] = useState('');
  const [formTitle, setFormTitle] = useState('');

  useEffect(() => {
    setCustomProperties(personaCustomProperties(persona))
  }, [persona]);
  
  function onFieldFormSuccess(key, value) {
    const mode = customProperties.find((item) => item.key === key) ? "edit" : "add"
    
    let updatedProperties
    if (mode === "edit") {
      updatedProperties = customProperties.map((item) => {
        if (item.key === key) {
          item.value = value;
        }
        return item;
      })
    } else {
      updatedProperties = [...customProperties, { key: key, value: value }]
    }
    setCustomProperties(updatedProperties)
    setShowFieldForm(false)
  }
  
  function onFieldFormCancel() {
    setShowFieldForm(false)
  }
  
  const onFieldAdd = async (key) => {
    setFormKey('')
    setFormValue('')
    setFormTitle(`Add Field`)
    setShowFieldForm(true)
  }

  const onFieldEdit = (key, value) => {
    setFormKey(key)
    setFormValue(value)
    setFormTitle(`Edit ${key} Field`)
    setShowFieldForm(true)
  }

  const onFieldDelete = async (key) => {
    const requestData = {
      upn: persona.upn,
      fieldLabel: key,
      fieldValue: "delete",
      fieldDelete: true,
    };

    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/persona`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      });
      if (response.ok) {
        const filteredProperties = customProperties.filter((item) => item.key !== key);
        setCustomProperties(filteredProperties);
      } else {
        console.log('field delete error')
      }
    } catch (error) {
      console.error(error)
    }
  };

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
      "notes",
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
    const sortedPropertiesArray = filteredPropertiesArray.sort((a, b) => a.key.localeCompare(b.key));
    return sortedPropertiesArray;
  }

  return (
    <>
      <div className="grid grid-cols-3 gap-2">
        {customProperties
          .filter((item) => item.key && item.value)
          .map((item, index) => (
            <div
              className="relative bg-gray-800 px-4 py-2 rounded-lg h-16"
              key={index}
              onMouseEnter={() => { setHoveredField(index) }}
              onMouseLeave={() => { setHoveredField(null) }}
            >
              <h4 className="mt-0.5 text-gray-400 text-sm capitalize">{item.key}</h4>
              <div className="mt-1 text-white text-sm font-bold overflow-hidden text-ellipsis overflow-hidden">
                {item.value}
              </div>
              {(hoveredField === index) && (
                <div className="absolute top-0 right-0 py-1 px-2 rounded-lg bg-red-gray-900">
                  <Button className="inline-block" type="icon" icon={faPenToSquare} click={() => { onFieldEdit(item.key, item.value) }} />
                  <Button className="inline-block ml-2" type="icon" icon={faTrash} click={() => { onFieldDelete(item.key) }} />
                </div>
              )}
            </div>
          ))
        }
        {persona.type === "participant" && (
          <button onClick={onFieldAdd} className="border border-indigo-400 rounded-lg h-16 cursor-pointer flex items-center justify-center">
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
            <h4 className="text-white font-bold text-center mb-5">{formTitle}</h4>
            <CustomFieldForm
              upn={persona.upn}
              fieldLabel={formKey}
              fieldValue={formValue}
              onCancel={onFieldFormCancel}
              onSuccess={onFieldFormSuccess}
            />
          </div>
        </Modal>
      )}
    </>
  )
}
