import { useLocation, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faUsers, faBuilding, faEnvelope } from '@fortawesome/free-solid-svg-icons'
import { faGithub, faGoogle, faSlack, faAmazon } from '@fortawesome/free-brands-svg-icons'
import Button from './Button';

export default function Table({
  data,
  currentPersonaUpn,
  showAccess = false,
  showUnlink = false,
  onUnlinkParticipant = null,
  orderBy = null,
  orderByDirection = null,
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);

  const tableLabels = showAccess ? ['Friendly Name', 'Platform', 'Type', 'Auth', 'Access'] : ['Friendly Name', 'Platform', 'Type', 'Auth']
  const tableLabelTypes = showAccess ? ['friendlyName', 'platform', 'type', 'authenticationMin', 'access'] : ['friendlyName', 'platform', 'type', 'authenticationMin']
  const platformLogos = {
    aws: faAmazon,
    github: faGithub,
    google: faGoogle,
    email: faEnvelope,
    slack: faSlack,
  }
  const typeLogos = {
    organization: faBuilding,
    account: faUser,
    team: faUsers,
  }
  const accesslabels = {
    "HAS_ALIAS": "Has Alias",
    "ALIAS_OF": "Alias Of",
    "INDIRECT_CONTROL": "Indirect",
    "READ_CONTROL": "Read",
    "GUEST_CONTROL": "Guest",
    "USER_CONTROL": "User",
    "ADMIN_CONTROL": "Admin",
    "SUPERADMIN_CONTROL": "Super Admin",
    "SYSTEM_CONTROL": "System",
  }
  
  if (showUnlink) {
    tableLabels.push('')
  }

  const selectPersona = (upn) => {
    queryParams.set('upn', upn);
    navigate(`${location.pathname}?${queryParams.toString()}`);
  }

  const handleSortTable = (order) => {
    const direction = (orderBy === order && orderByDirection === "ASC") ? "DESC" : "ASC"
    queryParams.set('orderBy', order);
    queryParams.set('orderByDirection', direction);
    navigate(`${location.pathname}?${queryParams.toString()}`);
  };

  const handleUnlickParticipant = (event, unlinkUpn) => {
    event.stopPropagation()
    onUnlinkParticipant(unlinkUpn)
  }

  return (
    <div className="relative bg-gray-900 w-full min-h-full">
      <table className="min-w-full">
        <thead className="sticky top-0">
          <tr>
          {tableLabels.map((label, index) => (
            <th key={label} scope="col" className="sticky top-0 px-4 py-6 text-left text-sm font-semibold bg-gray-900 text-white">
              <div className="absolute bottom-0 left-0 right-0 border-b border-gray-700"></div>
              <span onClick={() => { handleSortTable(tableLabelTypes[index]) }} className='cursor-pointer'>
                {label}
                {orderBy === tableLabelTypes[index] && orderByDirection === "ASC" && (
                  <span className="ml-2 text-xs">▲</span>
                )}
                {orderBy === tableLabelTypes[index] && orderByDirection === "DESC" && (
                  <span className="ml-2 text-xs">▼</span>
                )}
              </span>
            </th>
          ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800">
          {data?.length > 0 && data.map((item, index) => (          
            <tr
              key={index}
              className={(currentPersonaUpn === item.upn) ? 'bg-violet-600/30' : 'hover:bg-violet-600/10 cursor-pointer'}
              onClick={() => {selectPersona(item.upn)}}
            >
              <td className="whitespace-nowrap pl-4 py-4 text-sm font-medium text-white">
                <div className="flex gap-2 items-center">
                  {item.friendlyName}
                  {platformLogos[item.platform] &&
                    <FontAwesomeIcon icon={platformLogos[item.platform]} size="lg" />
                  }
                  {typeLogos[item.type] &&
                    <FontAwesomeIcon icon={typeLogos[item.type]} />
                  }
                </div>
              </td>
              <td className="whitespace-nowrap pl-4 py-4 text-sm text-gray-300">
                <div className="flex gap-2 items-center">
                  {platformLogos[item.platform] &&
                    <FontAwesomeIcon icon={platformLogos[item.platform]} size="lg" />
                  }
                  {item.platform}
                </div>
              </td>
              <td className="whitespace-nowrap pl-4 py-4 text-sm text-gray-300">
                <div className="flex gap-2 items-center">
                  {typeLogos[item.type] &&
                    <FontAwesomeIcon icon={typeLogos[item.type]} />
                  }
                  {item.type}
                </div>
              </td>
              <td className="whitespace-nowrap pl-4 py-4 text-sm text-gray-300">{item.authenticationMin && `${item.authenticationMin}FA`}</td>
              {showAccess && (
                <td className="whitespace-nowrap pl-4 py-4 text-sm text-gray-300">{accesslabels[item.access]}</td>
              )}
              {showUnlink && (
                <td><Button className="z-50" label="unlink" type="link" click={(event) => handleUnlickParticipant(event, item.upn)} /></td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
