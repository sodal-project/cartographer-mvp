export default function Table({
  data
}) {
  const labels = ['Name', 'Platform', 'Type', 'Role', 'Auth', 'ID', '']

  return (
    <div className="relative bg-gray-900 w-full min-h-full">
      <table className="min-w-full">
        <thead className="sticky top-0">
          <tr>
          {labels.map((label) => (
            <th key={label} scope="col" className="sticky top-0 px-4 py-6 text-left text-sm font-semibold bg-gray-900 text-white">
              <div className="absolute bottom-0 left-0 right-0 border-b border-gray-700"></div>
              {label}
            </th>
          ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800">
          {data.map((item) => (
            <tr key={item.upn} className="hover:bg-violet-600/10 cursor-pointer">
              <td className="whitespace-nowrap pl-4 py-4 text-sm font-medium text-white">
                {item.friendlyName}
              </td>
              <td className="whitespace-nowrap pl-4 py-4 text-sm text-gray-300">{item.platform}</td>
              <td className="whitespace-nowrap pl-4 py-4 text-sm text-gray-300">{item.type}</td>
              <td className="whitespace-nowrap pl-4 py-4 text-sm text-gray-300">{item.role}</td>
              <td className="whitespace-nowrap pl-4 py-4 text-sm text-gray-300">{item.authenticationMin}</td>
              <td className="whitespace-nowrap pl-4 py-4 text-sm text-gray-300">{item.id}</td>
              <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-300 text-right font-medium">
                <a href="#" className="text-indigo-400 hover:text-indigo-300">Delete</a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
