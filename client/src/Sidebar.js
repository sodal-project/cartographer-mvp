import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAddressBook } from '@fortawesome/free-regular-svg-icons'
import { faChartLine, faGears, faGear, faMap } from '@fortawesome/free-solid-svg-icons'

const navigation = [
  { name: 'Directory', icon: faAddressBook, href: '#', view: 'directory' },
  { name: 'Risk Analysis', icon: faChartLine, href: '#', view: 'risk' },
  { name: 'Integrations', icon: faGears, href: '#', view: 'integrations' },
  { name: 'Setup', icon: faGear, href: '#', view: 'setup' },
]

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function Sidebar({ activeView, onViewChange }) {
  return (
    <>
    <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-black/10 px-6">
          <div className="flex h-16 shrink-0 items-center text-indigo-500">
            <FontAwesomeIcon icon={faMap} size="xl" />
          </div>
          <nav className="flex flex-1 flex-col pt-10">
            <ul className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul className="-mx-2 space-y-1">
                  {navigation.map((item) => (
                    <li key={item.name}>
                      <a
                        onClick={() => onViewChange(item.view)}
                        href={item.href}
                        className={classNames(
                          activeView === item.view
                          ? 'bg-gray-800 text-white'
                          : 'text-gray-400 hover:text-white hover:bg-gray-800',
                          'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold items-center'
                          )}
                      >
                        <FontAwesomeIcon icon={item.icon} size="lg" />
                        {item.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </li>
              <li className="-mx-6 mb-2 mt-auto">
                <a
                  href="#"
                  className="flex items-center gap-x-4 px-6 py-3 text-sm font-semibold leading-6 text-white hover:bg-gray-800"
                >
                  <div className="h-8 w-8 rounded-full bg-gray-800" />
                  <span className="sr-only">Your profile</span>
                  <span aria-hidden="true">User Name</span>
                </a>
              </li>
            </ul>
          </nav>
        </div>
        
    </>
  )
}