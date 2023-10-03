import React, {useState} from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAddressBook } from '@fortawesome/free-regular-svg-icons'
import { faGears, faGear, faMap, faCircleNodes } from '@fortawesome/free-solid-svg-icons'

const navigation = [
  { name: 'Directory', icon: faAddressBook, href: '#', view: 'directory' },
  { name: 'Integrations', icon: faGears, href: '#', view: 'integrations' },
  { name: 'Node Browser', icon: faCircleNodes, href: 'http://localhost:7474/browser/' },
  { name: 'Setup', icon: faGear, href: '#', view: 'setup' },
]

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
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
                  <a
                    onClick={() => item.view && onViewChange(item.view)}
                    onMouseEnter={() => setHoverItem(item.name)}
                    onMouseLeave={() => setHoverItem(null)}
                    href={item.href}
                    target={!item.view ? "_blank" : "_self"}
                    className={classNames(
                      activeView === item.view
                      ? 'bg-gray-800 text-white'
                      : 'text-gray-500 hover:text-white hover:bg-gray-800',
                      'group flex rounded-md p-2 px-2 text-sm leading-6 font-semibold items-center'
                      )} rel="noreferrer"
                  >
                    <div className='inline-block w-6 text-center'>
                      <FontAwesomeIcon icon={item.icon} size="xl" />
                    </div>
                    <div className='absolute left-3 w-10 h-10 opacity-0 hover:opacity-100'>
                      <div className='absolute left-16 -ml-3 py-1.5 px-2.5 rounded bg-indigo-500 text-white whitespace-nowrap'>
                        <div className='absolute -left-1.5 top-3 rotate-45 bg-indigo-500 w-3 h-3'></div>
                        {item.name}
                      </div>
                    </div>
                    {/* {hoverItem === item.name && (
                      <div className='absolute left-16 border border-gray-600 py-1.5 px-2.5 rounded bg-gray-900'>
                        {item.name}
                      </div>
                    )} */}
                  </a>
                </li>
              ))}
            </ul>
          </li>
        </ul>
      </nav>
    </div>
  )
}
