import * as React from "react";
import PaginationItem from "components/PaginationItem";
import PaginationPrev from "components/PaginationPrev";
import PaginationNext from "components/PaginationNext";

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
  //TODO - cases for getPageItems():
  // 9 or more pages - show first 2 and last 2 link items with ellipses & form to go to page
  const getPageItems = () => {
    let pageButtonEls = [];
    for (let i = 1; i < totalPages + 1; i++) {
        pageButtonEls.push(
          <PaginationItem
            key={`pagination-${i}`}
            pageNum={i}
            isActive={i === activePage}
            handlePageChange={handlePageChange}
          />
        );
    }
    return pageButtonEls;
  };
  if (totalPages <= 1) {
    return null;
  }
  return (
    <nav aria-label="Pagination Navigation" role="navigation">
      <ul className="pagination">
        <PaginationPrev
          activePage={activePage}
          handlePageChange={handlePageChange}
        />
        {getPageItems()}
        <PaginationNext
          activePage={activePage}
          totalPages={totalPages}
          handlePageChange={handlePageChange}
        />
      </ul>
    </nav>
  );
};

export default PaginationSection;
