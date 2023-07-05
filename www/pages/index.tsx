import React, { useEffect, useState } from "react";
import type { GetServerSideProps, NextPage } from "next";
import { useRouter } from "next/router";
import Image from "next/image";

import FiltersBar from "components/FiltersBar";
import { getSyllabusCards } from "../components/utils/getSyllabusCards";
import PaginationSection from "components/PaginationSection";
import { ICollection, IMetaInformation, ISyllabiFilters, ISyllabus, IUser } from "types";

import searchIcon from '../public/icons/search-line.svg'
import clearIcon from '../public/icons/close-line.svg'
import { kurintoBook } from "app/layout";
import CollectionCard from "components/Collection/CollectionCard";
import SyllabusCard from "components/Syllabus/SyllabusCard";
import UserCard from "components/User/UserCard";
import Link from "next/link";

const PAGINATION_LIMIT = 15;

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  let payload = {
    syllabus: {} as ISyllabus,
    profile: {} as IUser,
    collection: {} as ICollection
  }

  const syll_url = new URL(`syllabi/c194a1f2-549b-442f-af01-0d4bab60a566`, process.env.API_URL);
  const syll_res = await fetch(syll_url)
  if (syll_res.ok) payload.syllabus = await syll_res.json()

  const coll_url = new URL(`collections/752b70e3-0d6b-4f72-8b77-0ec53c713db6`, process.env.API_URL);
  const coll_res = await fetch(coll_url)
  if (coll_res.ok) payload.collection = await coll_res.json()

  const user_url = new URL(`users/e7b74bcd-c864-41ee-b666-d3031f76c800`, process.env.API_URL);
  const user_res = await fetch(user_url)
  if (user_res.ok) payload.profile = await user_res.json()



  // console.log(payload.syllabus);


  return {
    props: {
      syllabus: payload.syllabus,
      collection: payload.collection,
      profile: payload.profile,
    },
  };
};

interface IHomeProps {
  syllabus: ISyllabus,
  collection: ICollection,
  profile: IUser,
}

const Home: NextPage<IHomeProps> = ({ syllabus, collection, profile }) => {
  const router = useRouter();
  const [searchTerms, setSearchTerms] = useState("")

  const handleSearchChange = (e: React.BaseSyntheticEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const v = e.target.value;
    setSearchTerms(v);
  };
  
  const startSearch = () => {
    router.push(`browse/?keywords=${encodeURI(searchTerms)}`)
  };

  const searchTag = (tag: string) => {
    router.push(`browse/?tags=${encodeURI(tag)}`)
  }

  const searchLevel = (level: string) => {
    router.push(`browse/?levels=${encodeURI(level)}`)
  }


  return (
    <div className="flex flex-col w-11/12 sm:w-full lg:w-10/12 m-auto">

      <div className="h-96 flex flex-col gap-2 items-center justify-center">
        <h1 className={`${kurintoBook.className} text-4xl`}>Cosyll</h1>
        <h2 className={`${kurintoBook.className} text-xl w-10/12 mx-auto text-center`}>is a platform for publishing, sharing and archiving syllabi.</h2>
      </div>

      <hr className="border-gray-400" />

      {/* SEARCH BAR */}
      <div className="w-11/12 h-64 m-auto md:w-full my-8 flex flex-col justify-center">
        <h3 className="text-sm text-center my-2">PICK A TOPIC TO START BROWSING</h3>
        <div className="flex flex-wrap md:gap-2 gap-4 justify-center m-4">
          <button className="py-1 px-2 border border-black rounded-3xl text-sm hover:shadow-md" onClick={() => searchTag("history")}>History</button>
          <button className="py-1 px-2 border border-black rounded-3xl text-sm hover:shadow-md" onClick={() => searchTag("introduction")}>Introduction</button>
          <button className="py-1 px-2 border border-black rounded-3xl text-sm hover:shadow-md" onClick={() => searchLevel("2")}>Master's</button>
          <button className="py-1 px-2 border border-black rounded-3xl text-sm hover:shadow-md" onClick={() => searchTag("design")}>Design</button>
          <button className="py-1 px-2 border border-black rounded-3xl text-sm hover:shadow-md" onClick={() => searchTag("Islam")}>Islam</button>
          <button className="py-1 px-2 border border-black rounded-3xl text-sm hover:shadow-md" onClick={() => searchTag("media studies")}>Media Studies</button>
        </div>
        <div className="w-full mt-3 mb-3 flex flex-row justify-center">
          <input
            className="w-10/12 md:w-7/12 bg-transparent border-b-2 border-b-gray-900"
            type="text"
            id="search-terms"
            placeholder="Or search for keywords..."
            onChange={handleSearchChange}
            onKeyDown={(e: React.KeyboardEvent) => {
              if (e.key === "Enter") startSearch()
            }}
          ></input>
          <button className="mx-1" onClick={startSearch} >
            <Image src={searchIcon} width="24" height="24" alt="Icon to start the search" />
          </button>
        </div>
      </div>

      <hr className="border-gray-400" />

      <div className="min-h-96 flex flex-col justify-center my-8">
        <h3 className="text-sm text-center my-12">FEATURED</h3>
        <div className="min-h-96 flex flex-col justify-center gap-16 md:gap-4">
          <div className="md:w-7/12">
            <h4 className="text-md my-2">SYLLABUS</h4>
            <SyllabusCard syllabusInfo={syllabus} />
          </div>
          <div className="md:w-7/12 self-end">
            <h4 className="text-md my-2 text-right">COLLECTION</h4>
            <CollectionCard collection={collection} />
          </div>
          <div className="md:w-7/12">
            <h4 className="text-md my-2">PROFILE</h4>
            <UserCard user={profile} isAdmin={false} />
          </div>
        </div>
      </div>

      <hr className="border-gray-400" />

      <div className="min-h-96 flex flex-col justify-center my-8">
        <h3 className="text-sm text-center my-12">ABOUT</h3>
        <div className="w-5/6 md:w-1/2 m-auto flex flex-col gap-6">
          <p><b>Cosyll</b> is an infrastructure for open-access of syllabi and curricula; it is a place where we can meaningfully search, archive, distribute and reference syllabi.</p>
          <p>
            Whether to have a convenient place to publish your classes for your personal portfolio, to see how a similar class is being taught at another university, in another country, or to find inspiration in your peers' works, Cosyll focuses on exchange between teachers.
          </p>
          <p>
            In this spirit, we encourage the sharing of documents one does not always easily find online: schedules, assignments descriptions, works cited and referenced, class wikis, etc. You can get started by <Link className="underline font-bold" href="/new-syllabus">contributing a syllabus</Link>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;
