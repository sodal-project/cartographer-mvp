import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAddressBook } from '@fortawesome/free-regular-svg-icons'
import { faChartLine, faGears, faGear, faMap, faCircleNodes } from '@fortawesome/free-solid-svg-icons'

const navigation = [
  { name: 'Directory', icon: faAddressBook, href: '#', view: 'directory' },
  // { name: 'Risk Analysis', icon: faChartLine, href: '#', view: 'risk' },
  { name: 'Integrations', icon: faGears, href: '#', view: 'integrations' },
  { name: 'Node Browser', icon: faCircleNodes, href: 'http://localhost:7474/browser/' },
  { name: 'Setup', icon: faGear, href: '#', view: 'setup' },
]

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function Sidebar({ activeView, onViewChange }) {
  return (
    <>
    <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-black/10 px-5">
          <div className="flex pt-6 h-16 shrink-0 items-center text-indigo-500">
            <FontAwesomeIcon icon={faMap} size="xl" />
          </div>
          <nav className="flex flex-1 flex-col pt-8">
            <ul className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul className="-mx-2 space-y-3">
                  {navigation.map((item) => (
                    <li key={item.name} className="flex items-center">
                      <a
                        onClick={() => item.view && onViewChange(item.view)}
                        href={item.href}
                        target={!item.view ? "_blank" : "_self"}
                        className={classNames(
                          activeView === item.view
                          ? 'text-white'
                          : 'text-gray-400 hover:text-white',
                          'group flex gap-x-3 rounded-md text-sm leading-6 font-semibold items-center'
                          )} rel="noreferrer"
                      >

                        <div
                          className={classNames(
                            activeView === item.view
                            ? 'bg-gray-800'
                            : '',
                            'py-2 w-10 rounded text-center'
                            )}
                        >
                          <FontAwesomeIcon icon={item.icon} size="xl" />
                        </div>
                        <div className="whitespace-nowrap">
                          {item.name}
                        </div>
                      </a>
                    </li>
                  ))}
                </ul>
              </li>
              {/* <li className="-mx-6 mb-2 mt-auto">
                <a
                  href="#"
                  className="flex items-center gap-x-4 px-6 py-3 text-sm font-semibold leading-6 text-white hover:bg-gray-800"
                >
                  <div className="h-8 w-8 rounded-full bg-gray-800" />
                  <span className="sr-only">Your profile</span>
                  <span aria-hidden="true">User Name</span>
                </a>
              </li> */}
            </ul>
          </nav>
        </div>
        
    </>
  )
}
