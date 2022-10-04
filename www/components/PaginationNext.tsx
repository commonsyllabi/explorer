import * as React from "react";

interface IPaginationNextProps {
  activePage: number;
  totalPages: number;
  handlePageChange: Function;
}

const PaginationNext: React.FunctionComponent<IPaginationNextProps> = ({
  activePage,
  totalPages,
  handlePageChange,
}) => {
  const getTargetPage = (event: React.SyntheticEvent) => {
    event.preventDefault();
    event.stopPropagation();
    handlePageChange(activePage + 1);
  };

  if (activePage >= totalPages) {
    return (
      <li className="page-item disabled">
        <span className="page-link">Next</span>
      </li>
    );
  }
  return (
    <li className="page-item" onClick={getTargetPage}>
      <span className="page-link">Next</span>
    </li>
  );
};

export default PaginationNext;
