import type { GetServerSideProps, NextPage } from "next";
import Head from "next/head";

import GlobalNav from "components/GlobalNav";
import TagsFiltersBar from "components/TagFiltersBar";

import { getSyllabusCards } from "../components/utils/getSyllabusCards";

import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { ISyllabiFilters, ISyllabus } from "types";
import Favicons from "components/head/favicons";
import { useState } from "react";

export const getServerSideProps: GetServerSideProps = async () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const url = new URL("syllabi/", apiUrl);

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
  }
  const payload = await res.json();

  return {
    props: {
      syllabiListings: payload.syllabi,
    },
  };
};

interface IHomeProps {
  syllabiListings: ISyllabus[];
}

const Home: NextPage<IHomeProps> = ({ syllabiListings }) => {
  const [filters, setFilters] = useState<ISyllabiFilters>({
    academic_level: "",
    academic_field: "",
    academic_term: "",
    language: "",
    tags: [],
  })

  const handleFilterChange = (filters : ISyllabiFilters) => {
    setFilters(filters)
  }

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
      </Container>

      <Container>
        <Row className="d-flex flex-row-reverse">
          <Col lg={4} className="pb-3 border-bottom border-lg-bottom-0">
            <TagsFiltersBar updateFilters={handleFilterChange}/>
          </Col>
          <Col lg={8} className="pt-3 pb-5 d-flex flex-column gap-3">
            {getSyllabusCards(syllabiListings, filters)}
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default Home;
