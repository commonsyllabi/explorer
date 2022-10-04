import * as React from "react";
import PaginationItem from "components/PaginationItem";

interface IPaginationSectionProps {
  totalPages: number;
  activePage: number;
  handlePageChange: Function;
}

const PaginationSection: React.FunctionComponent<IPaginationSectionProps> = ({
  totalPages,
  activePage,
  handlePageChange,
}) => {
  const getPageItems = () => {
    let pageButtonEls = [];
    for (let i = 1; i < totalPages + 1; i++) {
      if (i === activePage) {
        pageButtonEls.push(
          <PaginationItem
            key={`pagination-${i}`}
            pageNum={i}
            isActive={true}
            handlePageChange={handlePageChange}
          />
        );
      } else {
        pageButtonEls.push(
          <PaginationItem
            key={`pagination-${i}`}
            pageNum={i}
            isActive={false}
            handlePageChange={handlePageChange}
          />
        );
      }
    }
    return pageButtonEls;
  };
  //cases:
  //only 1 page - don't display
  //2 to 4 pages - show each link item
  //5 or more pages - show first 2 and last 2 link items with ellipses & form to go to page
  if (totalPages <= 1) {
    return null;
  }
  return (
    <nav aria-label="Pagination Navigation" role="navigation">
      <ul className="pagination">
        <li className="page-item disabled">
          <span className="page-link">Previous</span>
        </li>

        {getPageItems()}

        <li className="page-item">
          <a className="page-link" href="#">
            Next
          </a>
        </li>
      </ul>
    </nav>
  );
};

export default PaginationSection;
