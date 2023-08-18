import { faCaretDown } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export default function FlowArrow() {
  return (
    <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 h-5 text-gray-600">
      <div className="h-5 w-px bg-gray-600" />
      <FontAwesomeIcon icon={faCaretDown} size="lg" className="absolute top-2 -translate-x-1/2" />
    </div>
  )
}
