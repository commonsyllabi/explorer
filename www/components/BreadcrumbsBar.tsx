import Container from "react-bootstrap/Container";
import Link from "next/link";
import Dropdown from "react-bootstrap/Dropdown";

import { FunctionComponent } from "react";

export const BreadcrumbsBar: FunctionComponent = () => {
  return (
    <Container className="border-bottom">
      <div className="pt-3 d-grid gap-2 d-flex justify-content-between align-items-baseline">
        <div className="breadcrumbs d-flex">
          <Link href="/user">
            <p>@patshiu&nbsp;</p>
          </Link>
          <p>/&nbsp;collections&nbsp;</p>
          <p>/&nbsp;Web Design History</p>
        </div>
      </div>
    </Container>
  );
};
