import React from 'react';

export default function Bubble({
  title,
  children,
  className,
  size,
  pointPosition = "center"
}) {
  const sizeClass = size === "small" ? 'w-40' : 'w-80'
  const pointClass = {
    right: 'right-3',
    rightish: 'right-16',
    center: 'left-1/2 -translate-x-1/2',
  }

  return (
    <div className={`shadow-md shadow-black rounded-md bg-gray-900 border border-gray-600 flex flex-col items-start gap-2 p-4 ${sizeClass} ${className}`}>
      <div className={`bg-gray-900 w-3 h-3 absolute -top-1.5  transform rotate-45 border-t border-l border-gray-600 ${pointClass[pointPosition]}`} />
      {title && (
        <h4 className="text-white text-sm text-center w-full mb-2">{title}</h4>
      )}
      {children}
    </div>
  )
}
