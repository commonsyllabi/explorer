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
    // console.log(`TRYING TO GO TO PAGE ${t.id}`);
    handlePageChange(parseInt(t.id));
  };
  if (isActive) {
    return (
      <li className="page-item active">
        <a
          className="page-link"
          aria-label={`Current Page, Page ${pageNum}`}
          aria-current="true"
          id={pageNum.toString()}
          onClick={getTargetPage}
          href="#"
        >
          {pageNum}
        </a>
      </li>
    );
  }
  return (
    <li className="page-item">
      <a
        className="page-link"
        aria-label={`Goto Page ${pageNum}`}
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
