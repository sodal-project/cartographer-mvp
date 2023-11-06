import React from 'react';
import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

function getClasses(type) {
  const baseClasses = "block transition-all whitespace-nowrap select-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
  switch (type) {
    case 'solid': 
      return `${baseClasses} rounded-md bg-indigo-500 px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-indigo-400`
    case 'outline':
      return `${baseClasses} rounded-md border border-indigo-500 px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-indigo-400 hover:text-white`
    case 'outline-small':
      return `${baseClasses} rounded-md border border-indigo-500 px-3 h-9 text-center text-sm font-semibold text-white hover:bg-indigo-400 hover:text-white`
    case 'outline-circle':
      return `${baseClasses} border border-indigo-500 w-10 h-10 text-center text-sm font-semibold text-white rounded-full hover:bg-indigo-400 hover:text-white`
    case 'outline-circle-small':
      return `${baseClasses} border border-indigo-500 w-9 h-9 text-center text-sm font-semibold text-white rounded-full hover:bg-indigo-400 hover:text-white`
    case 'link':
      return `${baseClasses} text-sm font-semibold text-indigo-400 hover:text-indigo-300`
    case 'small': 
      return `${baseClasses} rounded bg-indigo-500 px-2 py-1.5 text-center text-xs text-white hover:bg-indigo-400`
    case 'icon':
      return `${baseClasses} text-xs text-gray-400 hover:text-white relative -top-0.5`
    default: 
      return `${baseClasses} rounded-md bg-indigo-500 px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-indigo-400`
  }
}

export default function Button({
  label,
  click,
  type = 'solid',
  submit = false,
  to = null,
  disabled = false,
  icon = null,
  className = null,
}) {
  const classes = `${getClasses(type)}`

  if (submit) {
    return (
      <button type="submit" className={`${className} ${classes}`}>
        {label}
      </button>
    )
  } else if (to) {
    return (
      <Link to={to} className={`${classes} ${disabled && "opacity-40 pointer-events-none"} ${className}`} >
        { label }
        { icon && <FontAwesomeIcon icon={icon} size="lg" className={label ? "ml-2" : ""} /> }
      </Link>
    )
  } else {
    return (
      <button onClick={disabled ? () => {} : click} className={`${classes} ${disabled && "opacity-40 pointer-events-none"} ${className}`} type="button">
        {label}
        { icon && <FontAwesomeIcon icon={icon} size="lg" className={label ? "ml-2" : ""} /> }
      </button>
    )
  }
}