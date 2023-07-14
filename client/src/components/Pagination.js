import React from 'react'
import Button from './Button'
import { faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons';

export default function Pagination({
  itemCount = 0,
  perPage,
  currentPage,
  changePerPage,
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
      <div>
        <select
          id="type"
          name="type"
          defaultValue={perPage}
          onChange={changePerPage}
          className="block w-full rounded-md border-0 bg-white/5 py-2.5 px-1 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6 [&_*]:text-black"
        >
          <option value="50">50 Per Page</option>
          <option value="100">100 Per Page</option>
          <option value="250">250 Per Page</option>
          <option value="500">500 Per Page</option>
        </select>
      </div>
      <div className="flex gap-4 items-center justify-end">
        <p className="text-sm text-gray-300 whitespace-nowrap select-none">
          Showing <span className="font-medium">{from}</span>
          <span> to </span>
          <span className="font-medium">{to}</span>
          <span> of </span>
          <span className="font-medium">{itemCount}</span> results
        </p>
        <div className="flex gap-3">
          <Button disabled={isFirstPage} click={prevClick} type="outline" label="" icon={faArrowLeft} />
          <Button disabled={isLastPage} click={nextClick} type="outline" label="" icon={faArrowRight} />
        </div>
      </div>

    </nav>
  )
}
