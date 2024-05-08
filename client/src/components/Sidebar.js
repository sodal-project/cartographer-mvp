import React, {useState} from 'react';
import { NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAddressBook } from '@fortawesome/free-regular-svg-icons'
import { faGears, faGear, faMap, faCircleNodes } from '@fortawesome/free-solid-svg-icons'

const navigation = [
  { name: 'Directory', icon: faAddressBook, href: '/', view: 'directory' },
  { name: 'Integrations', icon: faGears, href: '/integrations', view: 'integrations' },
  { name: 'Setup', icon: faGear, href: '/setup', view: 'setup' },
  { name: 'Node Browser', icon: faCircleNodes, href: `${process.env.REACT_APP_DB_URL}/browser/` },
]

function isActiveClasses(isActive) {
  const baseClasses = "flex items-center rounded-md p-2 text-gray-500 text-sm font-semibold leading-6 hover:text-white hover:bg-gray-800"
  const activeClasses = "bg-gray-800 text-white"
  return isActive ? `${baseClasses} ${activeClasses}` : baseClasses
}

export default function Sidebar({ activeView, onViewChange }) {
  const [hoverItem, setHoverItem] = useState(null)

  return (
    <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-black/10 px-4 pt-4 w-16">
      <div className="flex h-16 shrink-0 items-center text-indigo-500 px-1">
        <FontAwesomeIcon icon={faMap} size="xl" />
      </div>
      <nav className="flex flex-1 flex-col pt-6">
        <ul className="flex flex-1">
          <li>
            <ul className="-mx-1 space-y-3">
              {navigation.map((item) => (
                <li key={item.name}>
                  <NavLink to={item.href}
                    onMouseEnter={() => setHoverItem(item.name)}
                    onMouseLeave={() => setHoverItem(null)}
                    target={!item.view ? "_blank" : "_self"}
                    className={({ isActive }) => isActiveClasses(isActive)}
                    rel="noreferrer"
                  >
                    <div className='inline-block w-6 text-center'>
                      <FontAwesomeIcon icon={item.icon} size="xl" />
                    </div>
                    {hoverItem === item.name && (
                      <div className='absolute left-20 -ml-3 py-1.5 px-2.5 rounded bg-indigo-500 text-white whitespace-nowrap'>
                        <div className='absolute -left-1.5 top-3 rotate-45 bg-indigo-500 w-3 h-3'></div>
                        {item.name}
                      </div>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </li>
        </ul>
      </nav>
    </div>
  )
}
