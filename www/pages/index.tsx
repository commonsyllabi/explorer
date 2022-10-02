import type { GetServerSideProps, NextPage } from "next";
import Head from "next/head";

import GlobalNav from "components/GlobalNav";
import FiltersBar from "components/FiltersBar";
import TagsFiltersBar from "components/TagFiltersBar";

import { getSyllabusCards } from "../components/utils/getSyllabusCards";

import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { ISyllabus } from "types";
import Favicons from "components/head/favicons";

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

  console.log(`payload PAGES is: ${JSON.stringify(payload.pages)}`);
  console.log(`payload TOTAL is: ${JSON.stringify(payload.total)}`);

  return {
    props: {
      pages: payload.pages,
      totalSyllabi: payload.total,
      syllabiListings: payload.syllabi,
    },
  };
};

interface IHomeProps {
  pages: number;
  totalSyllabi: number;
  syllabiListings: ISyllabus[];
}

const Home: NextPage<IHomeProps> = ({
  pages,
  totalSyllabi,
  syllabiListings,
}) => {
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
            <TagsFiltersBar />
          </Col>
          <Col lg={8} className="pt-3 pb-5 d-flex flex-column gap-3">
            {getSyllabusCards(syllabiListings)}
          </Col>
        </Row>
        <Row>
          Pages: {pages}; Total: {totalSyllabi}
        </Row>
      </Container>
    </>
  );
};

export default Home;
