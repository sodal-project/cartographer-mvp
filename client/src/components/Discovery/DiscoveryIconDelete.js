import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export default function FlowDelete({ onClick, show = true }) {
  return (
    <>
      {show && (
        <FontAwesomeIcon icon={faTrash} onClick={onClick}
          className="text-white absolute right-3 top-3 opacity-50 hover:opacity-100 cursor-pointer" />
      )}
    </>
  )
}
