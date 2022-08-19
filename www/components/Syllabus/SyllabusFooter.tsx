import * as React from "react";
import Link from "next/link";

import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

interface ISyllabusFooterProps {
  author: string;
  authorUUID: string;
  uploadDate: string;
}

const SyllabusFooter: React.FunctionComponent<ISyllabusFooterProps> = ({
  author,
  authorUUID,
  uploadDate,
}) => {
  const readableDate = new Date(uploadDate).toString();
  const [weekday, month, day, year, ...theRest] = readableDate.split(" ");
  return (
    <Row className="border-top py-3" id="footer">
      <Col lg={8}>
        <p className="small text-center">
          Uploaded by{" "}
          <Link href={`/user/${encodeURIComponent(authorUUID)}`}>
            <a className="text-muted">{author}</a>
          </Link>{" "}
          on {weekday} {month} {day} {year}
        </p>
      </Col>
      <Col lg={2}>
        <p className="small text-center">flag for review</p>
      </Col>
    </Row>
  );
};

export default SyllabusFooter;
