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
      <li className="disabled">
        Next
      </li>
    );
  }
  return (
    <li className="cursor-pointer" data-cy="nextPage" onClick={getTargetPage}>
      Next
    </li>
  );
};

export default PaginationNext;
