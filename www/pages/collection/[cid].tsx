import type { GetServerSideProps, NextPage } from "next";
import Head from "next/head";
import Image from "next/image";

import { IUser, ISyllabus } from "types";

import { GlobalNav } from "components/GlobalNav";
import { FiltersBar } from "components/FiltersBar";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

import TagsFiltersBar from "components/TagFiltersBar";
import SyllabusCard from "components/SyllabusCard";
import { BreadcrumbsBar } from "components/BreadcrumbsBar";

import { getSyllabusCards } from "pages/utils/getSyllabusCards";

export const getServerSideProps: GetServerSideProps = async (context) => {
  const collectionId = context.params!.cid;
  const apiUrl = process.env.API_URL;
  const url = new URL(`collections/${collectionId}`, apiUrl)

  console.log(`USER ID: ${collectionId}`);
  console.log(`API URL: ${apiUrl}`);
  console.log(`FETCH URL: ${url}`);

  const res = await fetch(url);
  const collectionInfo = await res.json();

  // console.log(collectionInfo);

  return {
    props: collectionInfo,
  };
};

interface ICollectionProps {
  uuid: string;
  status: string;
  name: string;
  description: string;
  syllabi: ISyllabus[];
  user_uuid: string;
  user: IUser;
}

const Collection: NextPage<ICollectionProps> = (props) => {
  return (
    <div className="container">
      <Head>
        <title>{props.name}</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div id="header-section" className="sticky-top">
        <GlobalNav />
        <BreadcrumbsBar
          user={props.user.name}
          userId={props.user_uuid}
          category="collections"
          pageTitle={props.name}
        />
      </div>

      <Container>
        <Row className="pt-3 pb-3">
          <h1>{props.name}</h1>
          {props.description ? (
            <p className="collection-description">props.description</p>
          ) : (
            <p className="text-muted">
              <em>No description.</em>
            </p>
          )}
        </Row>
        <Row className="gap-3 pb-5">{getSyllabusCards(props.syllabi)}</Row>
      </Container>
    </div>
  );
};

export default Collection;
