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
      <li className=" disabled">
        Previous
      </li>
    );
  }
  return (
    <li className="cursor-pointer" data-cy="prevPage" onClick={getTargetPage}>
      Previous
    </li>
  );
};

export default PaginationPrev;
