import React, { useEffect, useState } from "react";
import type { GetServerSideProps, NextPage } from "next";
import { useRouter } from "next/router";
import Image from "next/image";

import FiltersBar from "components/FiltersBar";
import { getSyllabusCards } from "../components/utils/getSyllabusCards";
import PaginationSection from "components/PaginationSection";
import { IMetaInformation, ISyllabiFilters, ISyllabus } from "types";

import searchIcon from '../public/icons/search-line.svg'
import clearIcon from '../public/icons/close-line.svg'

const PAGINATION_LIMIT = 15;

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const url = new URL(`syllabi/`, process.env.NEXT_PUBLIC_API_URL);
  const page = query.page ? (query.page as string) : "1";
  const keywords = query.keywords ? (query.keywords as string) : "";
  const tags = query.tags ? (query.tags as string) : "";
  if (query.page !== "1") url.searchParams.append("page", page);
  if (keywords !== "") url.searchParams.append("keywords", keywords);
  if (tags !== "") url.searchParams.append("tags", tags);

  const res = (await fetch(url).catch((err) => {
    return {
      props: {}
    };
  })) as Response;

  if (!res.ok) {
    return {
      props: {}
    };
  }

  const payload = await res.json();
  const total_pages = Math.floor(payload.syllabi.length / PAGINATION_LIMIT) + 1;
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
  const [currentPath, setCurrentPath] = useState("");
  const [currentQuery, setCurrentQuery] = useState(router.query);
  const [syllabi, setSyllabi] = useState<ISyllabus[]>();
  const [syllabiCount, setSyllabiCount] = useState(syllabiListings.length);
  const [totalPages, setTotalPages] = useState(total);
  const [searchTerms, setSearchTerms] = useState("");
  const [filters, setFilters] = useState<ISyllabiFilters>({
    academic_level: "",
    academic_field: "",
    academic_year: "",
    language: "",
    tags_include: [],
    tags_exclude: [],
  });

  useEffect(() => {
    setSyllabi(syllabiListings);
  }, [syllabiListings]);

  //-- parses query params into filters
  //-- should be done only once at the beginning
  useEffect(() => {
    if (router.query.year) {
      setFilters({ ...filters, academic_year: router.query.year[0] });
    }

    if (router.query.fields) {
      setFilters({ ...filters, academic_field: router.query.fields[0] });
    }

    if (router.query.levels) {
      setFilters({ ...filters, academic_level: router.query.levels[0] });
    }

    if (router.query.languages) {
      setFilters({ ...filters, language: router.query.languages[0] });
    }

    if (router.query.tags) {
      setFilters({ ...filters, tags_include: router.query.tags as string[] });
    }
  }, []);

  const updateRouterQueryParams = (filters: ISyllabiFilters) => {
    if (filters.academic_year != "")
      setCurrentQuery({ ...currentQuery, year: filters.academic_year });

    if (filters.academic_field != "")
      setCurrentQuery({ ...currentQuery, fields: filters.academic_field });

    if (filters.academic_level != "")
      setCurrentQuery({ ...currentQuery, levels: filters.academic_level });

    if (filters.language != "")
      setCurrentQuery({ ...currentQuery, languages: filters.language });

    if (filters.tags_include.length != 0)
      setCurrentQuery({ ...currentQuery, tags: filters.tags_include });
  };

  //-- this useEffect() listens for changes from the search bar or the filters bar
  //-- it resets the activePage to 1, then updates the cards, totals and pages
  useEffect(() => {
    // paginationHandler(1)
    const s = getSyllabusCards(syllabi, filters, false, 1);
    if (s === undefined) return;

    setTotalPages(Math.ceil(s.total / PAGINATION_LIMIT));
    setSyllabiCount(s.total);
  }, [syllabi, filters]);

  useEffect(() => {
    updateRouterQueryParams(filters);
  }, [filters]);

  //-- listens for path and query changes and updates the URL
  useEffect(() => {
    router.push({
      pathname: currentPath as string,
      query: currentQuery,
    });
  }, [currentPath, currentQuery]);

  const paginationHandler = (page: number) => {
    setCurrentQuery({ ...currentQuery, page: page.toString() });
    setActivePage(page);
  };

  const getCurrentPage = () => {
    const query = router.query;
    if (query.page) {
      const pageParams = query.page;
      if (pageParams.length) return parseInt(pageParams[0]);
      else return parseInt(pageParams as string);
    }
    return 1;
  };

  const [activePage, setActivePage] = useState(getCurrentPage());

  const getAllSyllabi = () => {
    if (activePage > totalPages || activePage < 1)
      return getSyllabusCards(syllabi, filters, false, 1)?.elements;
    else return getSyllabusCards(syllabi, filters, false, activePage)?.elements;
  };

  const handleSearchChange = (e: React.BaseSyntheticEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const v = e.target.value;
    setSearchTerms(v);
  };

  const startSearch = () => {
    const url = new URL(`syllabi/?keywords=${encodeURI(searchTerms)}`, process.env.NEXT_PUBLIC_API_URL);

    fetch(url)
      .then((res) => {
        if (res.ok) return res.json();
        else console.warn("Problem with search!", res.statusText);
      })
      .then((data) => {
        setSyllabi(data.syllabi);
        setSyllabiCount(data.syllabi.length);
        setTotalPages(Math.ceil(data.syllabi.length / PAGINATION_LIMIT));

        setCurrentPath(router.query.pathname as string);
        setCurrentQuery({ ...router.query, keywords: searchTerms });
      })
      .catch((err) => {
        console.error("Problem with search", err);
      });
  };

  const clearSearch = () => {
    const st = document.getElementById("search-terms") as HTMLInputElement;
    if (st != null) st.value = "";
    setSearchTerms("");
    setSyllabi(syllabiListings);
    setCurrentQuery({});
    paginationHandler(1);
  };

  const handleFilterChange = (filters: ISyllabiFilters) => {
    if (!Object.values(filters).some((v) => v.length !== 0))
      //-- if filters are being reset
      setCurrentQuery({});
    else paginationHandler(1);

    setFilters(filters);
  };

  return (
    <div className="flex flex-col w-11/12 sm:w-full lg:w-10/12 m-auto">

      {/* SEARCH BAR */}
      <div className="w-11/12 m-auto md:w-full mt-3 mb-3 flex justify-between">
        <div className="w-full mt-3 mb-3 flex flex-row items-center">
          <input
            className="w-full bg-transparent border-b-2 border-b-gray-900"
            type="text"
            id="search-terms"
            placeholder="Search syllabi (e.g. intro to sociology...)"
            onChange={handleSearchChange}
          ></input>
          <button className="hidden md:block mx-1" onClick={clearSearch} >
            <Image src={clearIcon} width="24" height="24" alt="Icon to clear the search" />
          </button>
          <button className="mx-1" onClick={startSearch} >
            <Image src={searchIcon} width="24" height="24" alt="Icon to start the search" />
          </button>
        </div>
      </div>

      <div className="w-11/12 m-auto md:w-full my-2">
        {syllabiCount === 1
          ? `Found 1 syllabus.`
          : `Found ${syllabiCount} syllabi.`}
      </div>

      <div className="flex flex-col-reverse md:flex-row justify-between">
        <div className="w-11/12 m-auto md:m-0 md:w-7/12 pt-3 pb-5 flex flex-col">
          {getAllSyllabi()}
        </div>
        <div className="w-11/12 md:w-4/12 m-auto md:m-0 pb-3 border-bottom border-lg-bottom-0">
          <FiltersBar updateFilters={handleFilterChange} meta={meta} />
        </div>
      </div>
      <div>
        <PaginationSection
          totalPages={totalPages}
          activePage={activePage}
          handlePageChange={paginationHandler}
        />
      </div>
    </div>
  );
};

export default Home;
