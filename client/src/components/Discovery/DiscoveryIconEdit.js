import { faPencil } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export default function FlowEdit({ onClick, show = true }) {
  return (
    <>
      {show && (
        <FontAwesomeIcon icon={faPencil} onClick={onClick}
          className="text-white absolute right-9 top-3 opacity-50 hover:opacity-100 cursor-pointer" />
      )}
    </>
  )
}
