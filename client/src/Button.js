import React from 'react';

export default function Button({
  label,
  click,
}) {
  return (
    <button
      onClick={click}
      type="button"
      className="block rounded-md bg-indigo-500 px-3 py-2 text-center text-sm font-semibold text-white hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
    >
      {label}
    </button>
  )
}