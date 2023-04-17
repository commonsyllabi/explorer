import React, { useState } from "react";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import { useSession } from "next-auth/react";
import type { GetServerSidePropsContext } from "next"
import { getToken } from "next-auth/jwt";

import { IUser } from "types";

import { getSyllabusCards } from "components/utils/getSyllabusCards";
import UserProfileSidebar from "components/User/UserProfileSidebar";
import { getCollectionCards } from "components/utils/getCollectionCards";
import NotFound from "components/commons/NotFound";
import NewCollection from "components/Collection/NewCollection";
import { kurintoSerif } from "app/layout";

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const userId = context.params!.uid;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const t = await getToken({ req: context.req, secret: process.env.NEXTAUTH_SECRET })
  const token = t ? (t.user as { _id: string, token: string }).token : '';
  const url = new URL(`users/${userId}`, apiUrl);

  const h = new Headers();
  if (t)
    h.append("Authorization", `Bearer ${token}`);

  const res = await fetch(url, { headers: h });
  if (res.ok) {
    const userInfo = await res.json();

    if (userInfo.syllabi === null)
      return {
        props: {
          userInfo: userInfo
        }
      }

    let full_syllabi = []
    for (const syll of userInfo.syllabi) {
      const r = await fetch(new URL(`syllabi/${syll.uuid}`, apiUrl), { headers: h })
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
        userInfo: userInfo
      }
    };
  } else {
    return {
      props: {
        userInfo: {}
      },
    };
  }

};

interface IUserPageProps {
  userInfo: IUser
}

const UserPage: NextPage<IUserPageProps> = ({ userInfo }) => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const focusedTab = router.query["tab"]
  const [activeTab, setActiveTab] = useState(focusedTab ? focusedTab : "syllabi")
  const [syllFilter, setSyllFilter] = useState("");
  const [collFilter, setCollFilter] = useState("");
  const [isCreatingCollection, setIsCreatingCollection] = useState(false)

  const checkIfAdmin = () => {
    if (session != null && session.user != null) {
      return session.user._id === userInfo.uuid;
    }
    return false
  };

  const default_filters = {
    academic_level: "",
    academic_field: "",
    academic_year: "",
    language: "",
    tags_include: [],
    tags_exclude: [],
  }

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

  if (Object.keys(userInfo).length === 0) {
    return (
      <NotFound />
    )
  }

  return (
    <>
      <Head>
        <title>{`Cosyll | ${userInfo.name}`}</title>
        <meta
          name="description"
          content={`${userInfo.name} shares and collects syllabi on Cosyll.`}
        />
      </Head>

      <div>
        <div className="flex flex-col md:flex-row w-11/12 sm:w-full lg:w-10/12 m-auto mt-4 justify-between">

          <div className="w-full md:w-3/12 p-3">
            <UserProfileSidebar props={userInfo} apiUrl={`${process.env.NEXT_PUBLIC_API_URL}/users/${userInfo.uuid}`} isAdmin={checkIfAdmin()} />
          </div>

          <div className="w-full md:w-8/12 mx-auto mb-4">

            <div className="flex my-8" data-cy="userTabs">
              <div onClick={() => setActiveTab("syllabi")} className={`${kurintoSerif.className} text-xl mr-6 cursor-pointer ${activeTab === "syllabi" ? "font-bold underline underline-offset-4" : ""}`} data-cy="syllabiTab">Syllabi</div>
              <div onClick={() => setActiveTab("collections")} className={`${kurintoSerif.className} text-xl mr-6 cursor-pointer ${activeTab === "collections" ? "font-bold underline underline-offset-4" : ""}`} data-cy="collectionsTab">Collections</div>
            </div>

            {activeTab === "syllabi" ?
              <div title="Syllabi" data-cy="syllabiTab">
                <div className="flex justify-end items-baseline py-2 content-end">
                  <div className="flex w-12/12 md:w-10/12 gap-2 mb-8 justify-end">
                    <input
                      id="syllFilter"
                      type="text"
                      className="w-4/6 bg-transparent mt-2 py-1 border-b-2 border-b-gray-900"
                      placeholder="Search syllabi..."
                      aria-label="Filter"
                      value={syllFilter}
                      onChange={handleFilterChange}
                    />

                    {checkIfAdmin() ? (
                      <Link href="/new-syllabus" className=" w-2/3 md:w-3/12 text-center mt-4 py-2 bg-gray-900 text-gray-100 border-2 rounded-md" aria-label="New Syllabus" data-cy="newSyllabusLink">

                        + New Syllabus

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
                    checkIfAdmin()
                  )?.elements ? getSyllabusCards(
                    filteredSyllabi(),
                    default_filters,
                    checkIfAdmin()
                  )?.elements : "No syllabi yet."}
                </div>
              </div>
              :
              <div title="Collections" data-cy="collectionsTab">
                <div className="flex justify-end items-baseline py-2">

                  <div className="flex w-12/12 md:w-10/12 gap-2 mb-8 justify-end">
                    <input
                      id="collFilter"
                      type="text"
                      className="w-4/6 bg-transparent mt-2 py-1 border-b-2 border-b-gray-900"
                      placeholder="Search collections..."
                      aria-label="Filter"
                      value={collFilter}
                      onChange={handleFilterChange}
                    />

                    {checkIfAdmin() ? (
                      <button className="w-2/3 md:w-3/12 mt-4 py-2 bg-gray-900 text-gray-100 border-2 rounded-md" aria-label="New Collection" onClick={() => { setIsCreatingCollection(true) }}>
                        + New Collection
                      </button>
                    ) : (
                      <></>
                    )}
                  </div>
                </div>
                <div id="collections" className="flex flex-col gap-3">
                  {getCollectionCards(
                    filteredCollections(),
                    checkIfAdmin()
                  ) ? getCollectionCards(
                    filteredCollections(),
                    checkIfAdmin()
                  ) : "No collections yet."}
                </div>
              </div>
            }
          </div>
        </div>
      </div>

      {isCreatingCollection ?
        <NewCollection syllabusUUID="" handleClose={() => setIsCreatingCollection(false)} />
        :
        <></>
      }
    </>
  );
};

export default UserPage;
