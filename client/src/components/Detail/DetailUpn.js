import { useState } from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCopy, faCheck } from '@fortawesome/free-solid-svg-icons'

export default function DetailUpn({
  upn
}) {
  const [upnCopied, setUpnCopied] = useState(false)

  const onUpnCopied = () => {
    setUpnCopied(true)
    setTimeout(() => {
      setUpnCopied(false)
    }, 1000)
  }

  return (
    <div className="bg-gray-800 pl-4 pr-8 py-4 rounded-lg relative">
      <p className="text-sm text-white font-bold truncate ">{upn}</p>
      <CopyToClipboard text={upn} onCopy={onUpnCopied}>
        <div className="absolute top-0 right-0 p-3 h-full w-10 text-gray-400 hover:text-white cursor-pointer">
          {!upnCopied && (
            <FontAwesomeIcon icon={faCopy} />
          )}
          {upnCopied && (
            <>
              <div className="absolute -top-6 -right-2.5 text-xs text-white bg-gray-600 py-1.5 px-3 rounded">Copied!</div>
              <div className="absolute top-0 right-4 w-2 h-2 transform rotate-45 bg-gray-600" />
              <FontAwesomeIcon icon={faCheck} className="text-green-400" />
            </>
          )}
        </div>
      </CopyToClipboard>
    </div>
  )
}