import React, { useEffect, useState } from "react";
import type { GetServerSideProps, NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import Link from "next/link";

import GlobalNav from "components/GlobalNav";
import TagsFiltersBar from "components/TagFiltersBar";

import { getSyllabusCards } from "../components/utils/getSyllabusCards";
import PaginationSection from "components/PaginationSection";

import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { ISyllabus } from "types";
import Favicons from "components/head/favicons";

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const page = query.page;
  const url = new URL(`syllabi/?page=${page}`, apiUrl);

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
        totalPages: 0,
        totalSyllabi: 0,
        syllabiListings: [],
      },
    };
  }

  const payload = await res.json();

  console.log(`payload PAGES is: ${JSON.stringify(payload.pages)}`);
  console.log(`payload TOTAL is: ${JSON.stringify(payload.total)}`);

  return {
    props: {
      totalPages: payload.pages,
      totalSyllabi: payload.total,
      syllabiListings: payload.syllabi,
    },
  };
};

interface IHomeProps {
  totalPages: number;
  totalSyllabi: number;
  syllabiListings: ISyllabus[];
}

const Home: NextPage<IHomeProps> = ({
  totalPages,
  totalSyllabi,
  syllabiListings,
}) => {
  const router = useRouter();

  const pagginationHandler = (page: number) => {
    const currentPath = router.query.pathname;
    const currentQuery = {
      page: page,
    };
    setActivePage(page);
    router.push({
      pathname: currentPath as string,
      query: currentQuery,
    });
  };

  const getCurrentPage = () => {
    const query = router.query;
    if (query.page) {
      const pageParams = query.page;
      if (pageParams.length) {
        //if multiple page params, return just the first
        return parseInt(pageParams[0]);
      } else {
        //else if just one param, return that
        return parseInt(pageParams as string);
      }
    }
    //if no params return 0
    return 0;
  };

  const [activePage, setActivePage] = useState(getCurrentPage());

  const getPageContent = () => {
    let pageContent = [];

    if (activePage > totalPages || activePage < 1) {
      pageContent.push(
        <>
          <h2 className="h3 mt-5">The requested page is out of bounds.</h2>
          <Link href="">
            <a
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                pagginationHandler(1);
              }}
            >
              Go to main page
            </a>
          </Link>
        </>
      );
    } else {
      pageContent.push(getSyllabusCards(syllabiListings));
    }
    return pageContent;
  };

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
            {getPageContent()}
          </Col>
        </Row>
        <Row>
          <PaginationSection
            totalPages={totalPages}
            activePage={activePage}
            handlePageChange={pagginationHandler}
          />
        </Row>
      </Container>
    </>
  );
};

export default Home;
