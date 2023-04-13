import type { GetServerSideProps, GetServerSidePropsContext, NextPage } from "next";
import { useRouter } from "next/router";
import Head from "next/head";
import { getToken } from "next-auth/jwt";
import { useSession } from "next-auth/react";
import Image from "next/image";

import { ICollection, ISyllabus } from "types";

import BreadcrumbsBar from "components/BreadcrumbsBar";
import SyllabusResources from "components/Syllabus/SyllabusResources";
import Tags from "components/Tags";
import NotFound from "components/NotFound";
import Link from "next/link";

import {
  getInstitutionName,
  getInstitutionTermInfo,
  getInstitutionYearInfo,
} from "components/utils/getInstitutionInfo";
import SyllabusHeader from "components/Syllabus/SyllabusHeader";
import { useState } from "react";
import AddToCollection from "components/Collection/AddToCollection";
import addCircleIcon from '../../public/icons/add-circle-line.svg'
import deleteIcon from '../../public/icons/delete-bin-line.svg'
import { kurintoSerif } from "app/layout";
import SyllabusDeleteModal from "components/Syllabus/SyllabusDeleteModal";

export const getServerSideProps: GetServerSideProps = async (context: GetServerSidePropsContext) => {
  const syllabusId = context.params!.sid;
  let syllInfo;
  let collInfo;

  const t = await getToken({ req: context.req, secret: process.env.NEXTAUTH_SECRET })
  const token = t ? (t.user as { _id: string, token: string }).token : '';
  const userId = t ? (t.user as { _id: string, token: string })._id : '';

  const h = new Headers();
  if (t)
    h.append("Authorization", `Bearer ${token}`);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const syllUrl = new URL(`syllabi/${syllabusId}`, apiUrl);
  const userUrl = new URL(`users/${userId}`, apiUrl);

  //-- get syllabus info
  const syll_res = await fetch(syllUrl, { headers: h });
  if (syll_res.ok) {
    const data = await syll_res.json();
    syllInfo = data as ISyllabus;
  } else {
    syllInfo = {} as ISyllabus
  }

  //-- if logged in, get user collections
  const coll_res = await fetch(userUrl, { headers: h });
  if (coll_res.ok) {
    const data = await coll_res.json();
    collInfo = data.collections ? data.collections as ICollection[] : [] as ICollection[];
  } else {
    collInfo = [] as ICollection[]
  }

  if (syll_res.ok)
    return {
      props: {
        syllabusInfo: syllInfo,
        userCollections: collInfo,
      }
    }
  else
    return {
      props: {
        syllabusInfo: {},
        userCollections: {}
      }
    }
};

interface ISyllabusPageProps {
  syllabusInfo: ISyllabus,
  userCollections: ICollection[]
}

const Syllabus: NextPage<ISyllabusPageProps> = ({ syllabusInfo, userCollections }) => {
  const router = useRouter();
  const { data: session } = useSession()
  const [isAddingToCollection, showIsAddingToCollection] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [modalMessage, setModalMessage] = useState("")

  const checkIfAdmin = () => {
    if (session != null && session.user != null) {
      return session.user._id === syllabusInfo.user_uuid;
    }
    return false
  };

  if (Object.keys(syllabusInfo).length === 0) {
    return (
      <NotFound />
    )
  }

  return (
    <>
      <Head>
        <title>{`Cosyll | ${syllabusInfo.title}`}</title>
        <meta
          name="description"
          content={`${syllabusInfo.title} by ${syllabusInfo.user.name} on Cosyll`}
        />

      </Head>

      <div className="w-11/12 md:w-10/12 m-auto mb-4">


        <BreadcrumbsBar
          user={syllabusInfo.user.name}
          userId={syllabusInfo.user.uuid}
          category="syllabi"
          pageTitle={syllabusInfo.title}
        />

        {showDeleteModal ?
         <SyllabusDeleteModal syllabusInfo={syllabusInfo} handleClose={() => setShowDeleteModal(false)}/>
          : <></>}

        <div>
          <div className="flex mt-8">
            <div className="pt-3 pb-5 flex flex-col gap-3">
              <SyllabusHeader
                institution={getInstitutionName(syllabusInfo.institutions)}
                courseNumber={syllabusInfo.course_number}
                level={syllabusInfo.academic_level}
                fields={syllabusInfo.academic_fields}
                year={getInstitutionYearInfo(syllabusInfo.institutions)}
                term={getInstitutionTermInfo(syllabusInfo.institutions)}
              />
              <h1 className={`${kurintoSerif.className} text-3xl p-0 m-0`}>
                {syllabusInfo.title ? syllabusInfo.title : "Course Title"}
              </h1>

              <Link href={`/user/${syllabusInfo.user.uuid}`} className={`${kurintoSerif.className} `}>
                {syllabusInfo.user ? syllabusInfo.user.name : "Course Author / Instructor"}
              </Link>


              <div className="course-tags flex gap-2 mb-6">
                {syllabusInfo.tags ? (
                  <Tags tags={syllabusInfo.tags} />
                ) : (
                  <Tags tags={["tag 1", "tag 2", "tag 3"]} />
                )}
              </div>

              <div className="flex flex-col gap-5">
                <div>
                  <h2 className={`${kurintoSerif.className} text-lg mb-2`}>Course Overview</h2>
                  <p className="course-description" style={{ whiteSpace: 'pre-wrap' }}>
                    {syllabusInfo.description
                      ? syllabusInfo.description
                      : "Course description goes here..."}
                  </p>
                </div>

                <SyllabusResources resources={syllabusInfo.attachments} />
              </div>
            </div>
          </div>

          <div className="flex gap-2 items-baseline">
            {session ?
              <button onClick={() => showIsAddingToCollection(true)} className="p-2 border border-gray-900 rounded-md flex gap-3">
                <Image src={addCircleIcon} width="24" height="24" alt="Icon to add a syllabus to a collection" />
                <div>Add to collection</div>
              </button>
              :
              <></>
            }
            {checkIfAdmin() ?
              <button onClick={() => setShowDeleteModal(true)} className="mt-3 flex p-2 bg-red-400 hover:bg-red-500 text-white rounded-md gap-3" >
                <Image src={deleteIcon} width="24" height="24" alt="Icon to edit the name" />
                <div>Delete syllabus</div>
              </button>
              : <></>}
          </div>
          {isAddingToCollection ?
            <AddToCollection collections={userCollections} syllabusInfo={syllabusInfo} handleClose={() => showIsAddingToCollection(false)} />
            :
            <></>}
        </div>
      </div>
    </>
  );
};

export default Syllabus;
