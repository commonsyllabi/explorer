import React, { useEffect, useState } from "react";
import type { GetServerSideProps, NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import Link from "next/link";

import GlobalNav from "components/GlobalNav";
import FiltersBar from "components/FiltersBar";

import { getSyllabusCards } from "../components/utils/getSyllabusCards";
import PaginationSection from "components/PaginationSection";

import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { IMetaInformation, ISyllabiFilters, ISyllabus } from "types";
import Favicons from "components/head/favicons";
import { Button, Form, InputGroup } from "react-bootstrap";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;
const PAGINATION_LIMIT = 15

export const getServerSideProps: GetServerSideProps = async ({ query }) => {

  const page = query.page ? query.page : 1;
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

  const total_pages = Math.floor(payload.syllabi.length / PAGINATION_LIMIT) + 1

  return {
    props: {
      meta: payload.meta,
      totalPages: total_pages,
      syllabiListings: payload.syllabi,
    },
  };
};

interface IHomeProps {
  meta: IMetaInformation;
  total: number;
  syllabiListings: ISyllabus[];
}

const Home: NextPage<IHomeProps> = ({ meta, total, syllabiListings }) => {
  const router = useRouter();
  const [syllabi, setSyllabi] = useState(syllabiListings)
  const [syllabiCount, setSyllabiCount] = useState(syllabi.length)
  const [totalPages, setTotalPages] = useState(total)
  const [searchTerms, setSearchTerms] = useState("")
  const [filters, setFilters] = useState<ISyllabiFilters>({
    academic_level: "",
    academic_field: "",
    academic_year: "",
    language: "",
    tags_include: [],
    tags_exclude: [],
  });

  useEffect(() => {
    //-- this useEffect() listens for changes from the search bar or the filters bar
    //-- it resets the activePage to 1, then updates the cards, totals and pages

    paginationHandler(1)
    const s = getSyllabusCards(syllabi, filters, 1)
    if(s === undefined)
      return

    setTotalPages(Math.ceil(s.total / PAGINATION_LIMIT))
    setSyllabiCount(s.total)
  }, [syllabi, filters])

  const paginationHandler = (page: number) => {
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
      if (pageParams.length)
        return parseInt(pageParams[0]);
      else
        return parseInt(pageParams as string);
    }
    return 1;
  };

  const [activePage, setActivePage] = useState(getCurrentPage());

  const getPageContent = () => {
    if (activePage > totalPages || activePage < 1)
      return getSyllabusCards(syllabi, filters, 1)?.elements;
    else
      return getSyllabusCards(syllabi, filters, activePage)?.elements;
  };

  const handleSearchChange = (e: React.BaseSyntheticEvent) => {
    e.stopPropagation()
    e.preventDefault()
    const v = e.target.value
    setSearchTerms(v)
  }

  const startSearch = () => {
    const url = new URL(`syllabi/?keywords=${encodeURI(searchTerms)}`, apiUrl);

    fetch(url)
      .then(res => {
        if (res.ok)
          return res.json()
        else
          console.warn("Problem with search!")
      })
      .then(data => {
        setSyllabi(data.syllabi)
      })
      .catch(err => {
        console.error("Problem with search", err)
      })
  }

  const clearSearch = () => {
    const st = document.getElementById("search-terms") as HTMLInputElement
    if(st != null) st.value = ""
    setSearchTerms("")
    setSyllabi(syllabiListings)
  }

  const handleFilterChange = (filters: ISyllabiFilters) => {
    setFilters(filters);
  };

  return (
    <>
      <Head>
        <title>Cosyll</title>
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
        <Row>
          <Container className="mt-3 mb-3 d-flex justify-content-between">
            <InputGroup className="w-100 mt-3 mb-3">
              <Form.Control
                id="search-terms"
                placeholder="Search syllabi (e.g. intro to sociology...)"
                onChange={handleSearchChange}>
              </Form.Control>
              <Button onClick={clearSearch} variant="secondary">X</Button>
              <Button onClick={startSearch} variant="primary">Search</Button>
            </InputGroup>
          </Container>
        </Row>
        <Row>
          <Col>
            { syllabiCount === 1 ? `Found 1 syllabus.` : `Found ${syllabiCount} syllabi.`}
          </Col>
        </Row>
        <Row className="d-flex flex-row-reverse">
          <Col lg={4} className="pb-3 border-bottom border-lg-bottom-0">
            <FiltersBar updateFilters={handleFilterChange} meta={meta} />
          </Col>
          <Col lg={8} className="pt-3 pb-5 d-flex flex-column gap-3">
            {getPageContent()}
          </Col>
        </Row>
        <Row>
          <PaginationSection
            totalPages={totalPages}
            activePage={activePage}
            handlePageChange={paginationHandler}
          />
        </Row>
      </Container>
    </>
  );
};

export default Home;
