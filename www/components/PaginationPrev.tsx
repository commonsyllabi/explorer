import * as React from "react";

interface IPaginationPrevProps {
  activePage: number;
  handlePageChange: Function;
}

const PaginationPrev: React.FunctionComponent<IPaginationPrevProps> = ({
  activePage,
  handlePageChange,
}) => {
  const getTargetPage = (event: React.SyntheticEvent) => {
    event.preventDefault();
    event.stopPropagation();
    handlePageChange(activePage - 1);
  };

  if (activePage <= 1) {
    return (
      <li className="page-item disabled">
        <span className="page-link">Previous</span>
      </li>
    );
  }
  return (
    <li className="page-item" data-cy="prevPage" onClick={getTargetPage}>
      <span className="page-link">Previous</span>
    </li>
  );
};

export default PaginationPrev;
