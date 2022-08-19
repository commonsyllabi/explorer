import type { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";

import { GlobalNav } from "components/GlobalNav";
import CollectionCard from "components/CollectionCard";
import SyllabusCard from "components/SyllabusCard";

import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import Tab from "react-bootstrap/Tab";
import Tabs from "react-bootstrap/Tabs";

const About: NextPage = () => {
  return (
    <>
      <Head>
        <title>User Name | Syllabi Explorer</title>
        <meta name="description" content="Syllabi Explorer | user name" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Container>
        <div id="header-section" className="sticky-top">
          <GlobalNav />
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
                  Outside of work, I&apos;ve taught web design at Parsons School
                  of Design at The New School, and exhibited my art works in
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
            <div id="user-collection-index" className="py4 mb-5 border-bottom">
              <h2>Collections</h2>
              <div id="user-collection-index-public">
                <h3 className="h6">
                  Your Collections
                  <span className="badge bg-success ms-2">Public</span>
                </h3>
                <ul className="list-unstyled pb-3">
                  <li>
                    <Link href="#">
                      <a>Web Design History (12)</a>
                    </Link>
                  </li>
                </ul>
              </div>
              <div id="user-syllabi-index-private">
                <h3 className="h6">
                  Your Collections
                  <span className="badge bg-secondary ms-2">Private</span>
                </h3>
                <p className="notice-empty text-muted pb-3">
                  <em>No collections to display.</em>
                </p>
              </div>
            </div>
          </Col>
          <Col>
            <div className="py-4">
              <Tabs
                defaultActiveKey="syllabi"
                id="user-syllabi-collections-tabs"
                className="mb-3"
              >
                <Tab eventKey="syllabi" title="Syllabi">
                  <div className="d-flex justify-content-between align-items-baseline py-2">
                    <h2 className="inline h5">Syllabi shared by you</h2>
                    <div className="d-flex gap-2">
                      <Form>
                        <Form.Control
                          type="Filter"
                          className="form-control"
                          placeholder="Filter..."
                          aria-label="Filter"
                        />
                      </Form>
                      <Link href="/NewSyllabus">
                        <Button variant="primary" aria-label="New Syllabus">
                          + New
                        </Button>
                      </Link>
                    </div>
                  </div>
                  <SyllabusCard />
                </Tab>
                <Tab eventKey="collections" title="Collections">
                  <div className="d-flex justify-content-between align-items-baseline py-2">
                    <h2 className="inline h5">Your Collections</h2>
                    <div className="d-flex gap-2">
                      <Form>
                        <Form.Control
                          type="Filter"
                          className="form-control"
                          placeholder="Filter..."
                          aria-label="Filter"
                        />
                      </Form>
                      <Button variant="primary" aria-label="New Collection">
                        + New
                      </Button>
                    </div>
                  </div>
                  <CollectionCard />
                </Tab>
              </Tabs>
            </div>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default About;
