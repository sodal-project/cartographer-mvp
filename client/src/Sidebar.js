import { Fragment, useState } from 'react'

const navigation = [
  { name: 'Directory', href: '#', current: true },
  { name: 'Risk Analysis', href: '#', current: false },
  { name: 'Integrations', href: '#', current: false },
  { name: 'Setup', href: '#', current: false },
]

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function Example() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <>
    <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-black/10 px-6">
          <div className="flex h-16 shrink-0 items-center">
            <img
              className="h-8 w-auto"
              src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=500"
              alt="Cartographer"
            />
          </div>
          <nav className="flex flex-1 flex-col pt-10">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul role="list" className="-mx-2 space-y-1">
                  {navigation.map((item) => (
                    <li key={item.name}>
                      <a
                        href={item.href}
                        className={classNames(
                          item.current
                            ? 'bg-gray-800 text-white'
                            : 'text-gray-400 hover:text-white hover:bg-gray-800',
                          'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold'
                        )}
                      >
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
