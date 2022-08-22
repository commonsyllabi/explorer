import type { GetServerSideProps, NextPage } from "next";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";

import { ISyllabus, IInstitution, ICollection, IUser } from "types";

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
import UserLinks from "components/User/UserLinks";
import UserInstitutions from "components/User/UserInstitutions";
import UserListingsSection from "components/User/UserListingsSection";

import { getSyllabusCards } from "pages/utils/getSyllabusCards";
import UserProfileSidebar from "components/User/UserProfileSidebar";

export const getServerSideProps: GetServerSideProps = async (context) => {
  const userId = context.params!.uid;
  const apiUrl = process.env.API_URL;
  const url = apiUrl + "users/" + userId;

  console.log(`USER ID: ${userId}`);
  console.log(`API URL: ${apiUrl}`);
  console.log(`FETCH URL: ${url}`);

  const res = await fetch(url);
  const userInfo = await res.json();

  return {
    props: userInfo,
  };
};

const About: NextPage<IUser> = (props) => {
  // const router = useRouter();
  // const { uid } = router.query;

  return (
    <>
      <Head>
        <title>{props.name}</title>
        <meta name="description" content="Syllabi Explorer | user name" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Container>
        <div id="header-section" className="sticky-top">
          <GlobalNav />
        </div>
        <Row>
          <UserProfileSidebar props={props} />
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
                  <SyllabusCard
                    uuid={props.syllabi[0].uuid}
                    status={props.syllabi[0].status}
                    institution={props.syllabi[0].institution}
                    courseNumber={props.syllabi[0].institution}
                    term={props.syllabi[0].term}
                    year={props.syllabi[0].year}
                    title={props.syllabi[0].title}
                    author={props.name}
                    authorUUID={props.syllabi[0].user_uuid}
                    description={props.syllabi[0].description}
                    tags={props.syllabi[0].tags}
                  />
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
                  {/* <CollectionCard /> */}
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
