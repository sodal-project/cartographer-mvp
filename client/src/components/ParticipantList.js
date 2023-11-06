import React, {useState, useEffect} from 'react';
import Button from './Button';
import InputText from './InputText'

function ParticipantListItem({
  item,
  onParticipantNameClick,
  onLinkParticipant
}) {
  const [isHovered, setIsHovered] = useState(false);

  const handleParticipantLink = (event, item) => {
    event.stopPropagation();
    onLinkParticipant(item);
  }

  return (
    <li className="relative py-2 pl-4 hover:bg-gray-800"
      onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)} onClick={() => onParticipantNameClick(item)}>
      <span className="text-white text-sm">{item.friendlyName}</span>
      {isHovered && (
        <Button className="absolute right-2 top-1.5" label="Link" type="small" click={ (event) => { handleParticipantLink(event, item)}} />
      )}
    </li>
  )
}

export default function ParticipantList({
  participants,
  onParticipantNameClick,
  onLinkParticipant,
}) {
  const [filteredParticipants, setFilteredParticipants] = useState([]);

  const searchParticipants = (e) => {
    const searchString = e.target.value
    if (searchString !== '') {
      const updatedFilteredParticipants = filteredParticipants.filter((item) => item.friendlyName.toLowerCase().includes(e.target.value.toLowerCase()))
      setFilteredParticipants(updatedFilteredParticipants)
    } else {
      setFilteredParticipants(participants)
    }
  }

  useEffect(() => {
    setFilteredParticipants(participants)
  }, [participants]);
  
  return (
    <div className="absolute top-0 bottom-0 w-full flex flex-col bg-gray-900">
      <div className="flex-none p-4">
        <InputText placeholder="Search" onChange={searchParticipants} />
      </div>
      <div className="flex-1 overflow-y-scroll">
        <ul>
          {filteredParticipants.map((item, index) => (
            <ParticipantListItem key={index} item={item} onParticipantNameClick={onParticipantNameClick} onLinkParticipant={onLinkParticipant} />
          ))}
        </ul>
      </div>
    </div>
  )
}