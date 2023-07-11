export default function Table({
  data
}) {
  return (
    <div className="bg-gray-900 w-full min-h-full">
      <div className="flow-root">
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full align-middle">
            <table className="min-w-full divide-y divide-gray-700">
              <thead>
                <tr>
                  <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-white sm:pl-0">
                    Name
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white">
                    Platform
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white">
                    Type
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white">
                    Role
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white">
                    Auth
                  </th>
                  <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-white sm:pl-0">
                    ID
                  </th>
                  <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-0">
                    <span className="sr-only">Edit Delete</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {data.map((item) => (
                  <tr key={item.upn} className="hover:bg-violet-600/10 cursor-pointer">
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-white sm:pl-0">
                      {item.friendlyName}
                    </td>
                    <td className="whitespace-nowrap px-2 py-4 text-sm text-gray-300">{item.platform}</td>
                    <td className="whitespace-nowrap px-2 py-4 text-sm text-gray-300">{item.type}</td>
                    <td className="whitespace-nowrap px-2 py-4 text-sm text-gray-300">{item.role}</td>
                    <td className="whitespace-nowrap px-2 py-4 text-sm text-gray-300">{item.authenticationMin}</td>
                    <td className="whitespace-nowrap px-2 py-4 text-sm text-gray-300">{item.id}</td>
                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                      <a href="#" className="text-indigo-400 hover:text-indigo-300">
                        Delete<span className="sr-only"></span>
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
