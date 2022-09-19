import type { GetServerSideProps, NextPage } from "next";
import Head from "next/head";

import GlobalNav from "components/GlobalNav";
import FiltersBar from "components/FiltersBar";
import TagsFiltersBar from "components/TagFiltersBar";
import SyllabusCard from "components/SyllabusCard";

import { getSyllabusCards } from "../components/utils/getSyllabusCards";

import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { ISyllabus } from "types";
import { useEffect } from "react";
import Favicons from "components/head/favicons";

export const getServerSideProps: GetServerSideProps = async () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const url = require("node:url").resolve(apiUrl, "syllabi/");

  console.log(`LANDING SYLLABI FETCH URL: ${url}`);

  const res = (await fetch(url).catch((err) => {
    console.log(`error fetching backend: ${err}`);

    return {
      props: {
        syllabiListings: [],
      },
    };
  })) as Response;

  if (!res.ok) {
    return {
      props: {
        syllabiListings: [],
      },
    };
  } else {
  }
  const syllabiListings = await res.json();

  console.log(`FETCHED ${syllabiListings.length} SYLLABI`);
  return {
    props: {
      syllabiListings: syllabiListings,
    },
  };
};

interface IHomeProps {
  syllabiListings: ISyllabus[];
}

const Home: NextPage<IHomeProps> = ({ syllabiListings }) => {
  return (
    <>
      <Head>
        <title>Syllabi Explorer</title>
        <meta
          name="description"
          content="Share and browse syllabi and course materials."
        />
        <Favicons />
      </Head>
      <Container fluid id="header-section" className="sticky-top">
        <GlobalNav />
        <FiltersBar />
      </Container>

      <Container>
        <Row className="d-flex flex-row-reverse">
          <Col lg={4} className="pb-3 border-bottom border-lg-bottom-0">
            <TagsFiltersBar />
          </Col>
          <Col lg={8} className="pt-3 pb-5 d-flex flex-column gap-3">
            {getSyllabusCards(syllabiListings)}
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default Home;
