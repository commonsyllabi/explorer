import * as React from "react";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

interface ISyllabusFooterProps {
  instructors: string;
  author: string;
  uploadDate: string;
}

const SyllabusFooter: React.FunctionComponent<ISyllabusFooterProps> = ({
  instructors,
  author,
  uploadDate,
}) => {
  return (
    <Row className="border-top py-3" id="footer">
      <Col lg>
        <p className="small text-center">Syllabus by {instructors}</p>
      </Col>
      <Col lg>
        <p className="small text-center">
          Uploaded by {author} on {uploadDate}
        </p>
      </Col>
      <Col lg>
        <p className="small text-center">flag for review</p>
      </Col>
    </Row>
  );
};

export default SyllabusFooter;
