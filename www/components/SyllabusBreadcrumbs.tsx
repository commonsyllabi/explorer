import * as React from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import Breadcrumb from "react-bootstrap/Breadcrumb";

interface ISyllabusBreadcrumbsProps {}

const SyllabusBreadcrumbs: React.FunctionComponent<
  ISyllabusBreadcrumbsProps
> = (props) => {
  return (
    <Container className="border-top border-bottom">
      <Row className="pt-2 d-grid gap-2 d-flex justify-content-between align-items-baseline">
        <Col xs="auto" lg="3" className="border">
          <Button variant="link">← Back</Button>
        </Col>
        <Col
          id="breadcrumbs"
          className="d-none d-md-block d-flex justify-content-center border"
        >
          <Breadcrumb>
            <Breadcrumb.Item href="/">Home</Breadcrumb.Item>
            <Breadcrumb.Item active>Web Design Basics</Breadcrumb.Item>
          </Breadcrumb>
        </Col>
        <Col
          xs="auto"
          lg="3"
          id="syll-user-controls"
          className="d-flex justify-content-end border"
        >
          <Button variant="link">Flag</Button>
          <Button variant="link">Add to Collection</Button>
        </Col>
      </Row>
    </Container>
  );
};

export default SyllabusBreadcrumbs;
