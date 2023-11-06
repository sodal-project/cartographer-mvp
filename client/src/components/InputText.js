import React from 'react';

export default function InputText({
  id,
  name,
  placeholder,
  value,
  onChange,
  className = null
}) {
  return (
    <input
      type="text"
      id={id}
      name={name}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={`${className} w-full text-white bg-gray-900 border border-gray-600 text-sm`}
    />
  )
}