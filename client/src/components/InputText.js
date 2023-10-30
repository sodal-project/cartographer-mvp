import React from 'react';

export default function InputText({
  placeholder,
  onChange,
  className = null
}) {
  return (
    <input type="text" placeholder={placeholder} className={`${className} w-full text-white bg-gray-900 border border-gray-600 text-sm`} onChange={onChange} />
  )
}