import * as React from "react";

interface IPaginationItemProps {
  pageNum: number;
  isActive: boolean;
  handlePageChange: Function;
}

const PaginationItem: React.FunctionComponent<IPaginationItemProps> = ({
  pageNum,
  isActive,
  handlePageChange,
}) => {
  const getTargetPage = (event: React.SyntheticEvent) => {
    const t = event.target as HTMLInputElement;
    event.preventDefault();
    event.stopPropagation();
    handlePageChange(parseInt(t.id));
  };

  return (
    <li className={`page-item ${isActive ? 'underline font-bold' : ''}`}>
      <a
        className=""
        aria-label={`Current Page, Page ${pageNum}`}
        aria-current={isActive}
        id={pageNum.toString()}
        onClick={getTargetPage}
        href="#"
      >
        {pageNum}
      </a>
    </li>
  );
};

export default PaginationItem;
