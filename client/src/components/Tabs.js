function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function Tabs({
  tabs,
  current,
  setCurrentTab
}) {
  return (
    <div>
      <div className="border-b border-gray-700">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setCurrentTab(tab)}
              className={classNames(
                current === tab
                  ? 'border-indigo-500 text-white'
                  : 'border-transparent text-gray-400 hover:border-gray-500 hover:text-white',
                'whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium'
              )}
              aria-current={current === tab ? 'page' : undefined}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>
    </div>
  )
}