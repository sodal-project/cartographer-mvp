import React from 'react'
import Button from './Button'

export default function Pagination({
  itemCount = 0,
  perPage,
  currentPage,
  nextClick,
  prevClick
}) {
  const pageCount = Math.ceil(itemCount / perPage)
  const isFirstPage = currentPage === 1
  const isLastPage = currentPage >= pageCount
  const from = (currentPage - 1) * perPage + 1
  const to = isLastPage ? itemCount : currentPage * perPage

  return (
    <nav
      className="flex items-center justify-between"
      aria-label="Pagination"
    >
      <p className="text-sm text-gray-300 select-none">
        Showing <span className="font-medium">{from}</span>
        <span> to </span>
        <span className="font-medium">{to}</span>
        <span> of </span>
        <span className="font-medium">{itemCount}</span> results
      </p>
      <div className="flex flex-1 gap-4 justify-end">
        <Button disabled={isFirstPage} click={prevClick} type="outline" label="Previous" />
        <Button disabled={isLastPage} click={nextClick} type="outline" label="Next" />
      </div>
    </nav>
  )
}
