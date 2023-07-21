import ConfirmButton from '../components/ConfirmButton';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faUsers, faBuilding, faEnvelope } from '@fortawesome/free-solid-svg-icons'

import { faGithub } from '@fortawesome/free-brands-svg-icons'

export default function Table({
  data,
  rowClick,
  currentPersonaUpn
}) {
  const labels = ['ID', 'Platform', 'Type', 'Auth', 'Access', '']
  const platformLogos = {
    github: faGithub,
    email: faEnvelope,
  }
  const typeLogos = {
    organization: faBuilding,
    account: faUser,
    team: faUsers,
  }

  const trimFriendlyName = (friendlyName) => {
    const parts = friendlyName.split(':')
    if (parts.length === 1) return friendlyName
    return friendlyName.split(':')[1]
  }
  
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
          {data?.length > 0 && data.map((item) => (          
            <tr
              key={item.upn}
              className={(currentPersonaUpn === item.upn) ? 'bg-violet-600/30' : 'hover:bg-violet-600/10 cursor-pointer'}
              onClick={() => {rowClick(item.upn)}}
            >
              <td className="whitespace-nowrap pl-4 py-4 text-sm font-medium text-white">
                <div className="flex gap-2 items-center">
                  {trimFriendlyName(item.friendlyName)}
                  <FontAwesomeIcon icon={platformLogos[item.platform]} size="lg" />
                  <FontAwesomeIcon icon={typeLogos[item.type]} />
                </div>
              </td>
              <td className="whitespace-nowrap pl-4 py-4 text-sm text-gray-300">
                <div className="flex gap-2 items-center">
                  <FontAwesomeIcon icon={platformLogos[item.platform]} size="lg" />
                  {item.platform}
                </div>
              </td>
              <td className="whitespace-nowrap pl-4 py-4 text-sm text-gray-300">
                <div className="flex gap-2 items-center">
                  <FontAwesomeIcon icon={typeLogos[item.type]} />
                  {item.type}
                </div>
              </td>
              <td className="whitespace-nowrap pl-4 py-4 text-sm text-gray-300">2FA {item.authenticationMin}</td>
              <td className="whitespace-nowrap pl-4 py-4 text-sm text-gray-300">Owner {item.role}</td>
              <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-300 w-6">
                <ConfirmButton click={() => { }} /> 
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
