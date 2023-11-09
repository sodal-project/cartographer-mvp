import { useLocation, useNavigate } from 'react-router-dom';
import Button from './Button';
import { faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons';

export default function Pagination({
  itemCount = 0,
  pageSize = 50,
  page = 1,
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const pageCount = Math.ceil(itemCount / pageSize);
  const isFirstPage = page === 1;
  const isLastPage = page >= pageCount;
  const itemFrom = (page - 1) * pageSize + 1;
  const itemTo = isLastPage ? itemCount : page * pageSize;

  const changePerPage = (e) => {
    const pageSize = e.target.value;
    const queryParams = new URLSearchParams(location.search);
    queryParams.set('pageSize', pageSize);
    queryParams.set('page', '1');
    const url = `${location.pathname}?${queryParams.toString()}`;
    navigate(url);
  };

  const prevLink = () => {
    const queryParams = new URLSearchParams(location.search);
    queryParams.set('page', Number(page) - 1);
    return `${location.pathname}?${queryParams.toString()}`;
  }

  const nextLink = () => {
    const queryParams = new URLSearchParams(location.search);
    queryParams.set('page', Number(page) + 1);
    return `${location.pathname}?${queryParams.toString()}`;
  }

  return (
    <nav
      className="flex items-center justify-between"
      aria-label="Pagination"
    >
      <div className="flex gap-4 items-center justify-end">
        <div className="flex gap-3">
          <Button
            disabled={isFirstPage}
            to={prevLink()}
            type="outline"
            icon={faArrowLeft}
          />
          <Button
            disabled={isLastPage}
            to={nextLink()}
            type="outline"
            icon={faArrowRight}
          />
        </div>
        <p className="text-sm text-gray-300 whitespace-nowrap select-none">
          <span className="font-medium">{itemFrom}</span>
          <span> to </span>
          <span className="font-medium">{itemTo}</span>
          <span> of </span>
          <span className="font-medium">{itemCount}</span> results
        </p>
      </div>
      <div>
        <select
          id="perpage"
          name="perpage"
          value={pageSize}
          onChange={changePerPage}
          className="block w-36 rounded-md border-0 bg-white/5 py-2.5 px-3 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6 [&_*]:text-black"
        >
          <option value="10">10 Per Page</option>
          <option value="25">25 Per Page</option>
          <option value="50">50 Per Page</option>
          <option value="100">100 Per Page</option>
          <option value="250">250 Per Page</option>
          <option value="500">500 Per Page</option>
        </select>
      </div>
    </nav>
  );
}
