import type { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";

import { GlobalNav } from "components/GlobalNav";
import { FiltersBar } from "components/FiltersBar";
import SyllabusSchoolCodeYear from "components/Syllabus/SyllabusSchoolCodeYear";

import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";

const About: NextPage = () => {
  return (
    <>
      <Head>
        <title>About Syllabi Explorer</title>
        <meta name="description" content="About Syllabi Explorer" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Container>
        <div id="header-section" className="sticky-top">
          <GlobalNav />
          <FiltersBar />
        </div>
        <Row>
          <Col lg="4">
            <div id="user-profile" className="py-4">
              <div id="user-description" className="border-bottom pb-4">
                <h2>Pat Shiu</h2>
                <p>
                  My name is 邵沛嬋 Pat Shiu. I design things. I have led design
                  teams in Singapore &amp; Beijing and now live in New York,
                  where I am the Associate Director of Design. I work primarily
                  on Conifer (FKA Webrecorder), Rhizome’s open source tool for
                  creating and accessing web archives.
                </p>
                <p>
                  Outside of work, I've taught web design at Parsons School of
                  Design at The New School, and exhibited my art works in
                  digital and physical spaces. I also run a small print studio
                  OfficialFan . Club.
                </p>
              </div>
              <div id="user-teaches-at" className="py-4 border-bottom">
                <h3 className="h6">Teaches At</h3>
                <ul className="list-unstyled">
                  <li>The New School</li>
                  <li>New York University</li>
                </ul>
              </div>
              <div id="user-education" className="py-4 border-bottom">
                <h3 className="h6">Education</h3>
                <div className="user-education-item mb-3">
                  <p className="mb-0">
                    MFA, Visual Arts, Computing in the Arts,
                  </p>
                  <p className="mb-0">University of California, SanDiego,</p>
                  <p className="small">La Jolla, CA, United State of America</p>
                </div>
              </div>
            </div>
            <div id="user-syllabi-index" className="py4 mb-5 border-bottom">
              <h2>Syllabi</h2>
              <div id="user-syllabi-index-public">
                <h3 className="h6">
                  Your Syllabi
                  <span className="badge bg-success ms-2">Public</span>
                </h3>
                <ul className="list-unstyled pb-3">
                  <li>
                    <Link href="#">
                      <a>Politics of Code</a>
                    </Link>
                  </li>
                  <li>
                    <Link href="#">
                      <a>Alternate Realities</a>
                    </Link>
                  </li>
                  <li>
                    <Link href="#">
                      <a>Digital Culture</a>
                    </Link>
                  </li>
                </ul>
              </div>
              <div id="user-syllabi-index-private">
                <h3 className="h6">
                  Your Syllabi
                  <span className="badge bg-secondary ms-2">Private</span>
                </h3>
                <p className="notice-empty text-muted pb-3">
                  <em>No syllabus to display.</em>
                </p>
              </div>
            </div>
          </Col>
          <Col>
            <div className="d-flex justify-content-between align-items-baseline py-2">
              <h2 className="inline h5">Syllabi shared by you</h2>
              <Form className="inline col-3">
                <Form.Control
                  type="search"
                  className="form-control"
                  placeholder="Search..."
                  aria-label="Search"
                />
              </Form>
            </div>
            <Card>
              <Card.Body>
                <div className="syllabus-owner-controls d-flex justify-content-between align-items-baseline pb-2 mb-4 border-bottom">
                  <div className="d-flex align-items-baseline">
                    <span className="text-success fw-bold text-uppercase">
                      Public
                    </span>
                    <Button variant="link">Set to Private</Button>
                  </div>
                  <div>In 10 collections</div>
                  <Button variant="outline-dark">Edit</Button>
                </div>
                <SyllabusSchoolCodeYear
                  institution="Parson The New School of Design"
                  code="PSAM1028"
                  year="Spring 2019"
                />
                <Card.Title>
                  <Link href="/syllabus">
                    <a>Web Design Basics</a>
                  </Link>
                </Card.Title>
                <p className="course-instructors">Pat Shiu</p>
                <Card.Text className="course-description">
                  Web Design Basics is designed to introduce students to
                  programming as a creative medium—as a way of making and
                  exploring. The coursework focuses on developing a vocabulary
                  of interaction design principles which can then be applied
                  across a range of platforms. Students are encouraged to
                  experiment with various media, tools, and techniques,
                  ultimately producing a portfolio of interactive and visual
                  projects designed for the screen. An emphasis is placed on
                  typography as it applies to a screen context, research-based
                  problem solving and a “learning through making” approach to
                  technical skill building. Historical and current interaction
                  design precedents will be discussed.
                </Card.Text>
                <div className="course-tags d-flex gap-2">
                  <Button variant="outline-dark" className="btn-sm btn-tag">
                    web design
                  </Button>
                  <Button variant="outline-dark" className="btn-sm btn-tag">
                    foundation
                  </Button>
                  <Button variant="outline-dark" className="btn-sm btn-tag">
                    undergraduate
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default About;
