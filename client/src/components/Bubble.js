import React from 'react';

export default function Bubble({
  title,
  children,
  className,
  size
}) {
  return (
    <div className={`shadow-md shadow-black rounded-md bg-gray-900 border border-gray-600 flex flex-col items-start gap-2 p-4 ${size === "small" ? 'w-40' : 'w-80'} ${className}`}>
      {title && (
        <h4 className="text-white text-sm text-center w-full mb-2">{title}</h4>
      )}
      {children}
    </div>
  )
}
