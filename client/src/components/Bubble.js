import React from 'react';

export default function Bubble({
  title,
  children,
  className
}) {
  return (
    <div className={`${className} shadow-xl p-4 w-80 bg-gray-900 border border-gray-600 flex flex-col items-start gap-2`}>
      {title && (
        <h4 className="text-white text-sm text-center w-full mb-2">{title}</h4>
      )}
      {children}
    </div>
  )
}
