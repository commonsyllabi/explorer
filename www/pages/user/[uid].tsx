import React, { useEffect, useState } from "react";
import type { GetServerSideProps, NextApiRequest, NextApiResponse, NextPage } from "next";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import { useSession } from "next-auth/react";

import { ISyllabus, IUser } from "types";

import Favicons from "components/head/favicons";
import GlobalNav from "components/GlobalNav";

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
import NewCollection from "components/Collection/NewCollection";
import type { GetServerSidePropsContext } from "next"
import { getToken } from "next-auth/jwt";

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const userId = context.params!.uid;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;  
  const t = await getToken({req: context.req, secret: process.env.NEXTAUTH_SECRET})
  const token = t ? (t.user as { _id: string, token: string }).token : '';
  const url = new URL(`users/${userId}`, apiUrl);

  const h = new Headers();
  if(t)
    h.append("Authorization", `Bearer ${token}`);

  const res = await fetch(url, { headers: h });
  if (res.ok) {
    const userInfo = await res.json();

    if (userInfo.syllabi === null)
      return {
        props: {
          userInfo: userInfo,
          apiUrl: apiUrl
        }
      }

    let full_syllabi = []
    for (const syll of userInfo.syllabi) {
      const r = await fetch(new URL(`syllabi/${syll.uuid}`, apiUrl), {headers: h})
      if (r.ok) {
        const s = await r.json()
        full_syllabi.push(s)
      } else {
        console.log('could not get syllabus', r.status);
      }
    }
    userInfo.syllabi = full_syllabi

    return {
      props: {
        userInfo: userInfo,
        apiUrl: apiUrl
      }
    };
  } else {
    return {
      props: {},
    };
  }

};

interface IUserPageProps {
  userInfo: IUser;
  apiUrl: string,
}

const UserPage: NextPage<IUserPageProps> = ({ userInfo, apiUrl }) => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isAdmin, setIsAdmin] = useState(false);
  const [syllFilter, setSyllFilter] = useState("");
  const [collFilter, setCollFilter] = useState("");
  const [isCreatingCollection, setIsCreatingCollection] = useState(false)

  const checkIfAdmin = () => {
    if (session != null && session.user != null) {
      return session.user._id === userInfo.uuid;
    }
    return false
  };

  if (!userInfo) {
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
    return;
  };

  const filteredSyllabi = () => {
    if (userInfo.syllabi === undefined) {
      return undefined;
    }
    if (syllFilter.length > 0) {
      const results = userInfo.syllabi.filter((item) => {
        return (
          item.title.toLowerCase().includes(syllFilter.toLowerCase()) ||
          item.description.toLowerCase().includes(syllFilter.toLowerCase())
        );
      });
      return results;
    }
    return userInfo.syllabi;
  };

  const filteredCollections = () => {
    if (userInfo.collections === undefined) {
      return undefined;
    }
    if (collFilter.length > 0) {
      const results = userInfo.collections.filter((item) => {
        if (item.name.toLowerCase().includes(collFilter.toLowerCase())) {
          return true;
        }
        if (item.description) {
          if (item.description.toLowerCase().includes(collFilter.toLowerCase())) {
            return true;
          }
        }
        return false;
      });
      return results;
    }
    return userInfo.collections;
  };

  return (
    <>
      <Head>
        <title>{`Cosyll | ${userInfo.name}`}</title>
        <meta
          name="description"
          content={`${userInfo.name} shares and collects syllabi on Cosyll.`}
        />
        <Favicons />
      </Head>

      <Container fluid id="header-section" className="sticky-top">
        <GlobalNav />
      </Container>
      <Container>
        <Row>
          <UserProfileSidebar props={userInfo} apiUrl={`${apiUrl}/users/${userInfo.uuid}`} isAdmin={checkIfAdmin()} />
          <Col>
            <div className="py-4">
              <Tabs
                defaultActiveKey={activeTab as string}
                id="user-syllabi-collections-tabs"
                className="mb-3 gap-2"
                data-cy="userTabs"
              >
                <Tab eventKey="syllabi" title="Syllabi" data-cy="syllabiTab">
                  <div className="flex justify-content-between align-items-baseline py-2">
                    {checkIfAdmin() ? (
                      <h2 className="inline h5">Your syllabi</h2>
                    ) : (
                      <h2 className="inline h5">Syllabi by {userInfo.name}</h2>
                    )}

                    <div className="flex gap-2">
                      <Form>
                        <Form.Control
                          id="syllFilter"
                          type="Filter"
                          className="form-control"
                          placeholder="Search syllabi..."
                          aria-label="Filter"
                          value={syllFilter}
                          onChange={handleFilterChange}
                        />
                      </Form>

                      {/* Only allow new syllabus to be created if one is one their own page */}
                      {checkIfAdmin() ? (
                        <Link href="/NewSyllabus">
                          <Button variant="primary" aria-label="New Syllabus" data-cy="newSyllabusLink">
                            + New Syllabus
                          </Button>
                        </Link>
                      ) : (
                        <></>
                      )}

                    </div>
                  </div>
                  <div id="syllabi">
                    {getSyllabusCards(
                      filteredSyllabi(),
                      default_filters,
                      undefined,
                      userInfo.name,
                      checkIfAdmin()
                    )?.elements ? getSyllabusCards(
                      filteredSyllabi(),
                      default_filters,
                      undefined,
                      userInfo.name,
                      checkIfAdmin()
                    )?.elements : "No syllabi yet."}
                  </div>
                </Tab>
                <Tab eventKey="collections" title="Collections" data-cy="collectionsTab">
                  <div className="flex justify-content-between align-items-baseline py-2">
                    {checkIfAdmin() ? (
                      <h2 className="inline h5">Your Collections</h2>
                    ) : (
                      <h2 className="inline h5">Collections by {userInfo.name}</h2>
                    )}
                    <div className="flex gap-2">
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
                      {checkIfAdmin() ? (
                        <Button variant="primary" aria-label="New Collection" onClick={() => { setIsCreatingCollection(true) }}>
                          + New Collection
                        </Button>
                      ) : (
                        <></>
                      )}
                    </div>
                  </div>
                  <div id="collections">
                    {getCollectionCards(
                      filteredCollections(),
                      userInfo.name,
                      checkIfAdmin()
                    ) ? getCollectionCards(
                      filteredCollections(),
                      userInfo.name,
                      checkIfAdmin()
                    ) : "No collections yet."}
                  </div>
                </Tab>
              </Tabs>
            </div>
          </Col>
        </Row>

        {isCreatingCollection ?
          <NewCollection syllabusUUID="" handleClose={() => setIsCreatingCollection(false)}/>
          :
          <></>
        }
      </Container>
    </>
  );
};

export default UserPage;
