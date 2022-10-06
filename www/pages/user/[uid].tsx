import React, { useEffect, useState } from "react";
import type { GetServerSideProps, NextPage } from "next";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import { useSession } from "next-auth/react";

import { ISyllabus, IUser } from "types";

import Favicons from "components/head/favicons";
import GlobalNav from "components/GlobalNav";
import CollectionCard from "components/CollectionCard";
import SyllabusCard from "components/SyllabusCard";

import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Tab from "react-bootstrap/Tab";
import Tabs from "react-bootstrap/Tabs";

import { getSyllabusCards } from "components/utils/getSyllabusCards";
import UserProfileSidebar from "components/User/UserProfileSidebar";
import { getCollectionCards } from "components/utils/getCollectionCards";
import NotFound from "components/NotFound";

export const getServerSideProps: GetServerSideProps = async (context) => {
  const userId = context.params!.uid;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const url = new URL(`users/${userId}`, apiUrl);

  // console.log(`USER ID: ${userId}`);
  // console.log(`API URL: ${apiUrl}`);
  // console.log(`FETCH URL: ${url}`);

  const res = await fetch(url);
  if (res.ok) {
    const userInfo = await res.json();
    
    return {
      props: userInfo,
    };
  } else {
    return {
      props: {},
    };
  }

};

const About: NextPage<IUser> = (props) => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isAdmin, setIsAdmin] = useState(false);
  const [syllFilter, setSyllFilter] = useState("");
  const [collFilter, setCollFilter] = useState("");

  if (Object.keys(props).length === 0) {
    return (
      <NotFound />
    )
  }

  const default_filters = {
    academic_level: "",
    academic_field: "",
    academic_year: "",
    language: "",
    tags_include: [],
    tags_exclude: [],
  }

  const checkIfAdmin = () => {
    if (session != null && session.user != null) {
      const loggedInId = session.user._id;
      if (loggedInId === props.uuid) {
        // console.log(`THIS IS YOUR OWN PROFILE PAGE.`);
        return true;
      } else {
        // console.log(`THIS IS NOT YOUR PROFILE PAGE, VIEWING AS GUEST.`);
        return false;
      }
    }
    return false;
  };

  const focusedTab = router.query["tab"];
  const activeTab = focusedTab ? focusedTab : "syllabi";

  const handleFilterChange = (event: React.SyntheticEvent) => {
    const t = event.target as HTMLInputElement;
    if (t.id === "collFilter") {
      setCollFilter(t.value);
    }
    if (t.id === "syllFilter") {
      setSyllFilter(t.value);
    }
    console.log(`syllFilter: ${syllFilter}; collFilter: ${collFilter}`);
    return;
  };

  const filteredSyllabi = () => {
    if (props.syllabi === undefined) {
      return undefined;
    }
    if (syllFilter.length > 0) {
      const results = props.syllabi.filter((item) => {
        return (
          item.title.includes(syllFilter) ||
          item.description.includes(syllFilter)
        );
      });
      return results;
    }
    return props.syllabi;
  };

  const filteredCollections = () => {
    if (props.collections === undefined) {
      return undefined;
    }
    if (collFilter.length > 0) {
      const results = props.collections.filter((item) => {
        if (item.name.includes(collFilter)) {
          return true;
        }
        if (item.description) {
          if (item.description.includes(collFilter)) {
            return true;
          }
        }
        return false;
      });
      return results;
    }
    return props.collections;
  };

  return (
    <>
      <Head>
        <title>{props.name}</title>
        <meta
          name="description"
          content={`${props.name} shares and collects syllabi on Syllabi Explorer.`}
        />
        <Favicons />
      </Head>

      <Container fluid id="header-section" className="sticky-top">
        <GlobalNav />
      </Container>
      <Container>
        <Row>
          <UserProfileSidebar props={props} isAdmin={checkIfAdmin()} />
          <Col>
            <div className="py-4">
              <Tabs
                defaultActiveKey={activeTab as string}
                id="user-syllabi-collections-tabs"
                className="mb-3 gap-2"
              >
                <Tab eventKey="syllabi" title="Syllabi">
                  <div className="d-flex justify-content-between align-items-baseline py-2">
                    {checkIfAdmin() ? (
                      <h2 className="inline h5">Syllabi by you</h2>
                    ) : (
                      <h2 className="inline h5">Syllabi by {props.name}</h2>
                    )}

                    <div className="d-flex gap-2">
                      <Form>
                        <Form.Control
                          id="syllFilter"
                          type="Filter"
                          className="form-control"
                          placeholder="Filter..."
                          aria-label="Filter"
                          value={syllFilter}
                          onChange={handleFilterChange}
                        />
                      </Form>

                      <Link href="/NewSyllabus">
                        <Button variant="primary" aria-label="New Syllabus">
                          + New
                        </Button>
                      </Link>
                    </div>
                  </div>
                  <div id="syllabi">
                    {getSyllabusCards(
                      filteredSyllabi(),
                      default_filters,
                      props.name,
                      checkIfAdmin()
                    )}
                  </div>
                </Tab>
                <Tab eventKey="collections" title="Collections">
                  <div className="d-flex justify-content-between align-items-baseline py-2">
                    {checkIfAdmin() ? (
                      <h2 className="inline h5">Your Collections</h2>
                    ) : (
                      <h2 className="inline h5">Collections by {props.name}</h2>
                    )}
                    <div className="d-flex gap-2">
                      <Form>
                        <Form.Control
                          id="collFilter"
                          type="Filter"
                          className="form-control"
                          placeholder="Filter..."
                          aria-label="Filter"
                          value={collFilter}
                          onChange={handleFilterChange}
                        />
                      </Form>
                      <Button variant="primary" aria-label="New Collection">
                        + New
                      </Button>
                    </div>
                  </div>
                  <div id="collections">
                    {getCollectionCards(
                      filteredCollections(),
                      props.name,
                      checkIfAdmin()
                    )}
                  </div>
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
