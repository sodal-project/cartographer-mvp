import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

function getClasses(type) {
  const baseClasses = "block transition-all whitespace-nowrap select-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
  switch (type) {
    case 'solid': 
      return `${baseClasses} rounded-md bg-indigo-500 px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-indigo-400`
    case 'outline':
      return `${baseClasses} rounded-md border border-indigo-500 px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-indigo-400 hover:text-white`
    case 'outline-circle':
      return `${baseClasses} border border-indigo-500 px-4 py-2.5 text-center text-sm font-semibold text-white rounded-full hover:bg-indigo-400 hover:text-white`
    case 'outline-circle-sm':
      return `${baseClasses} border border-indigo-500 w-8 h-8 text-center text-sm font-semibold text-white rounded-full hover:bg-indigo-400 hover:text-white`
    case 'link':
      return `${baseClasses} text-sm font-semibold text-indigo-400 hover:text-indigo-300`
    default: 
      return `${baseClasses} rounded-md bg-indigo-500 px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-indigo-400`
  }
}

export default function Button({
  label,
  click,
  type = 'solid',
  submit = false,
  disabled = false,
  icon = null
}) {
  const classes = `${getClasses(type)}`

  if (submit) {
    return (
      <button type="submit" className={classes}>
        {label}
      </button>
    )
  } else {
    return (
      <button onClick={disabled ? () => {} : click} className={`${classes} ${disabled && "opacity-40 pointer-events-none"}`} type="button">
        {label}
        { icon && <FontAwesomeIcon icon={icon} className={label ? "ml-2" : ""} /> }
      </button>
    )
  }
}