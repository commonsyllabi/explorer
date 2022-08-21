import type { GetServerSideProps, NextPage } from "next";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";

import { ISyllabus, IInstitution, ICollection } from "types";

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
import { Props } from "next/script";
import { Params } from "next/dist/shared/lib/router/utils/route-matcher";
import { Context } from "vm";

export const getServerSideProps: GetServerSideProps = async (context) => {
  const userId = context.params!.uid;
  const apiUrl = process.env.API_URL;
  const url = apiUrl + "users/" + userId;

  console.log(`USER ID: ${userId}`);
  console.log(`API URL: ${apiUrl}`);
  console.log(`FETCH URL: ${url}`);

  const res = await fetch(url);
  const userInfo = await res.json();

  // console.log(userInfo);

  return {
    props: userInfo,
  };
};

interface IAboutProps {
  uuid: string;
  name: string;
  bio: string;
  urls?: string[];
  education?: string | string[];
  institutions?: IInstitution[];
  collections?: ICollection[];
  syllabi?: ISyllabus[];
}

const About: NextPage<IAboutProps> = (props) => {
  const router = useRouter();
  const { uid } = router.query;

  const getinstitutionNames = (
    institutionsArray: IInstitution[] | undefined
  ): string[] => {
    let instutionNames = [];
    if (institutionsArray) {
      for (let i = 0; i < institutionsArray.length; i++) {
        const name = institutionsArray[i].name;
        instutionNames.push(name);
      }
    }
    return instutionNames;
  };

  const getSyllabiList = (
    syllabiArray: ISyllabus[] | undefined,
    filterPrivate: boolean
  ) => {
    let syllabiList = [];
    if (syllabiArray) {
      for (let i = 0; i < syllabiArray.length; i++) {
        if (filterPrivate) {
          if (syllabiArray[i].status === "unlisted") {
            let syllabus = {
              uuid: syllabiArray[i].uuid,
              url: "/syllabus/" + syllabiArray[i].uuid,
              title: syllabiArray[i].title,
            };
            syllabiList.push(syllabus);
          }
        } else {
          if (syllabiArray[i].status === "listed") {
            let syllabus = {
              uuid: syllabiArray[i].uuid,
              url: "/syllabus/" + syllabiArray[i].uuid,
              title: syllabiArray[i].title,
            };
            syllabiList.push(syllabus);
          }
        }
      }
    }
    return syllabiList;
  };

  const getPrivateSyllabiList = (syllabiArray: ISyllabus[] | undefined) => {
    return getSyllabiList(syllabiArray, true);
  };

  const getPublicSyllabiList = (syllabiArray: ISyllabus[] | undefined) => {
    return getSyllabiList(syllabiArray, false);
  };

  const getCollectionList = (
    collectionArray: ICollection[] | undefined,
    filterPrivate: boolean
  ) => {
    let collectionList = [];
    if (collectionArray) {
      for (let i = 0; i < collectionArray.length; i++) {
        if (filterPrivate) {
          if (collectionArray[i].status === "unlisted") {
            let collection = {
              uuid: collectionArray[i].uuid,
              url:
                process.env.API_URL +
                "username/collections/" +
                collectionArray[i].uuid,
              title: collectionArray[i].name,
            };
            collectionList.push(collection);
          }
        } else {
          if (collectionArray[i].status === "listed") {
            let collection = {
              uuid: collectionArray[i].uuid,
              url:
                process.env.API_URL +
                "username/collections/" +
                collectionArray[i].uuid,
              title: collectionArray[i].name,
            };
            collectionList.push(collection);
          }
        }
      }
    }
    return collectionList;
  };

  const getPrivateCollectionList = (
    CollectionArray: ICollection[] | undefined
  ) => {
    return getCollectionList(CollectionArray, true);
  };

  const getPublicCollectionList = (
    CollectionArray: ICollection[] | undefined
  ) => {
    return getCollectionList(CollectionArray, false);
  };

  return (
    <>
      <Head>
        <title>User Name | Syllabi Explorer</title>
        <meta name="description" content="Syllabi Explorer | user name" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Container>
        <div id="header-section" className="sticky-top">
          <GlobalNav />
        </div>
        <Row>
          <Col lg="4">
            <div id="user-profile" className="py-4">
              <div id="user-description" className="border-bottom pb-4">
                <h2>{props.name}</h2>
                <p className="text-muted small">UUID: {uid}</p>
                <p>
                  {props.bio.length > 0
                    ? props.bio
                    : "User has not written a bio."}
                </p>
                {props.urls && <UserLinks links={props.urls} />}
              </div>

              <div id="user-teaches-at" className="py-4 border-bottom">
                <h3 className="h6">Teaches At</h3>
                <UserInstitutions
                  institutions={getinstitutionNames(props.institutions)}
                />
              </div>
              <div id="user-education" className="py-4 border-bottom">
                <h3 className="h6">Education</h3>
                <UserInstitutions institutions={props.education} />
              </div>
            </div>
            <UserListingsSection
              sectionTitle="Syllabi"
              sectionContents={getPublicSyllabiList(props.syllabi)}
              sectionPrivateContents={getPrivateSyllabiList(props.syllabi)}
            />
            <UserListingsSection
              sectionTitle="Collections"
              sectionContents={getPublicCollectionList(props.collections)}
              sectionPrivateContents={getPrivateCollectionList(
                props.collections
              )}
            />
          </Col>
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
                  <SyllabusCard />
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
                  <CollectionCard />
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
