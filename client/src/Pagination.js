import React from 'react'
import Button from './Button'

const items = [
  { id: 1, title: 'Back End Developer', department: 'Engineering', type: 'Full-time', location: 'Remote' },
  { id: 2, title: 'Front End Developer', department: 'Engineering', type: 'Full-time', location: 'Remote' },
  { id: 3, title: 'User Interface Designer', department: 'Design', type: 'Full-time', location: 'Remote' },
]

export default function Pagination({
  itemCount = 0,
}) {
  return (
    <nav
      className="flex items-center justify-between"
      aria-label="Pagination"
    >
      <p className="text-sm text-gray-300">
        Showing <span className="font-medium">1</span> to <span className="font-medium">10</span> of{' '}
        <span className="font-medium">{itemCount}</span> results
      </p>
      <div className="flex flex-1 gap-4 justify-end">
        <Button type="outline" label="Previous" />
        <Button type="outline" label="Next" />
      </div>
    </nav>
  )
}
