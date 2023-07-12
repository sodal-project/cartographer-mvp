import React from 'react';

function getClasses(type) {
  switch (type) {
    case 'solid': 
      return "bg-indigo-500 px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
    case 'outline':
      return "border border-indigo-500 px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-indigo-400 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
    default: 
      return "bg-indigo-500 px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
  }
}

export default function Button({
  label,
  click,
  type = 'solid',
  submit = false
}) {
  const classes = `block rounded-md transition-all ${getClasses(type)}`

  if (submit) {
    return (
      <button type="submit" className={classes}>
        {label}
      </button>
    )
  } else {
    return (
      <button onClick={click} type="button" className={classes}>
        {label}
      </button>
    )
  }
}