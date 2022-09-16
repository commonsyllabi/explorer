import React, { useEffect, useState } from "react";
import type { GetServerSideProps, NextPage } from "next";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";

import { IUser } from "types";

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
import { propTypes } from "react-bootstrap/esm/Image";
import { getCollectionCards } from "components/utils/getCollectionCards";

export const getServerSideProps: GetServerSideProps = async (context) => {
  const userId = context.params!.uid;
  const apiUrl = process.env.API_URL;
  const url = new URL(`users/${userId}`, apiUrl);

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
  const router = useRouter();
  const focusedTab = router.query["tab"];

  const activeTab = focusedTab ? focusedTab : "syllabi";

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
                defaultActiveKey={activeTab as string}
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
                  <div id="syllabi">{getSyllabusCards(props.syllabi)}</div>
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
                  <div id="collections">
                    {getCollectionCards(
                      props.collections,
                      props.name,
                      props.uuid
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
