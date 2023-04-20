import type { GetServerSideProps, GetServerSidePropsContext, NextPage } from "next";
import { useRouter } from "next/router";
import Head from "next/head";
import { getToken } from "next-auth/jwt";
import { useSession } from "next-auth/react";
import Image from "next/image";

import { ICollection, ISyllabus } from "types";

import BreadcrumbsBar from "components/commons/BreadcrumbsBar";
import SyllabusAttachments from "components/Syllabus/SyllabusAttachments";
import Tags from "components/Syllabus/Tags";
import NotFound from "components/commons/NotFound";
import Link from "next/link";

import {
  getInstitutionCountry,
  getInstitutionLang,
  getInstitutionName,
  getInstitutionTermInfo,
  getInstitutionYearInfo,
} from "components/utils/getInstitutionInfo";
import SyllabusHeader from "components/Syllabus/SyllabusHeader";
import { useState } from "react";
import AddToCollection from "components/Collection/AddToCollection";
import addCircleIcon from '../../public/icons/add-circle-line.svg'
import deleteIcon from '../../public/icons/delete-bin-line.svg'
import editIcon from '../../public/icons/edit-box-line.svg'
import { kurintoSerif } from "app/layout";
import SyllabusDelete from "components/Syllabus/SyllabusDelete";
import Modal from "components/commons/Modal";

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
          <Modal>
            <SyllabusDelete syllabusInfo={syllabusInfo} handleClose={() => setShowDeleteModal(false)} />
          </Modal>
          : <></>}

        <div>
          <div className="flex mt-8">
            <div className="pt-3 pb-5 flex flex-col gap-3">
              <SyllabusHeader
                institution={getInstitutionName(syllabusInfo.institutions)}
                country={getInstitutionCountry(syllabusInfo.institutions)}
                lang={getInstitutionLang(syllabusInfo.language)}
                courseNumber={syllabusInfo.course_number}
                level={syllabusInfo.academic_level}
                fields={syllabusInfo.academic_fields}
                year={getInstitutionYearInfo(syllabusInfo.institutions)}
                term={getInstitutionTermInfo(syllabusInfo.institutions)}
              />
              <h1 className={`${kurintoSerif.className} text-3xl p-0 m-0`}>
                {syllabusInfo.title ? syllabusInfo.title : "Course Title"}
              </h1>

              <Link href={`/user/${syllabusInfo.user.uuid}`} className={`${kurintoSerif.className} `} data-cy="courseInstructors">
                {syllabusInfo.user ? syllabusInfo.user.name : "Course Author / Instructor"}
              </Link>


              <div id="course-tags" className="flex gap-2 mb-6">
                <Tags tags={syllabusInfo.tags} />
              </div>

              <div className="flex flex-col gap-5">
                {syllabusInfo.description ?
                  <div>
                    <h2 className={`${kurintoSerif.className} font-bold text-lg mb-2`}>Course Overview</h2>
                    <p data-cy="course-description" className="whitespace-pre-wrap">
                      {syllabusInfo.description}
                    </p>
                  </div>
                  : <div>
                    <h2 className={`${kurintoSerif.className} font-bold text-lg mb-2`}>Course Overview</h2>
                    <p className="text-sm text-gray-400 whitespace-pre-wrap">
                      No description.
                    </p>
                  </div>}

                {syllabusInfo.learning_outcomes ?
                  <div>
                    <h2 className={`${kurintoSerif.className} font-bold text-lg mb-2`}>Learning outcomes</h2>
                    <ul data-cy="course-learning-outcomes" className="whitespace-pre-wrap">
                      {syllabusInfo.learning_outcomes.map((l, i) => (
                        <li key={`learnings-${i}`}>{l}</li>
                      ))}
                    </ul>
                  </div>
                  : <div>
                    <h2 className={`${kurintoSerif.className} font-bold text-lg mb-2`}>Learning outcomes</h2>
                    <p className="text-sm text-gray-400 whitespace-pre-wrap">
                      No learning outcomes.
                    </p>
                  </div>}

                {syllabusInfo.topic_outlines ?
                  <div>
                    <h2 className={`${kurintoSerif.className} font-bold text-lg mb-2`}>Topics outline</h2>
                    <ul data-cy="course-learning-outcomes" className="whitespace-pre-wrap">
                      {syllabusInfo.topic_outlines.map((t, i) => (
                        <li key={`topics-${i}`}>{t}</li>
                      ))}
                    </ul>
                  </div>
                  : <div>
                    <h2 className={`${kurintoSerif.className} font-bold text-lg mb-2`}>Topics outline</h2>
                    <p className="text-sm text-gray-400 whitespace-pre-wrap">
                      No topics outlined.
                    </p>
                  </div>}

                {syllabusInfo.readings ?
                  <div>
                    <h2 className={`${kurintoSerif.className} font-bold text-lg mb-2`}>Readings</h2>
                    <ul data-cy="course-readings" className="list-inside list-disc whitespace-pre-wrap">
                      {syllabusInfo.readings.map((r, i) => (
                        <li key={`readings-${i}`}>{r}</li>
                      ))}
                    </ul>
                  </div>
                  : <div>
                    <h2 className={`${kurintoSerif.className} font-bold text-lg mb-2`}>Readings</h2>
                    <p className="text-sm text-gray-400 whitespace-pre-wrap">
                      No readings assigned.
                    </p>
                  </div>}

                {syllabusInfo.grading_rubric ?
                  <div>
                    <h2 className={`${kurintoSerif.className} font-bold text-lg mb-2`}>Grading rubric</h2>
                    <p data-cy="course-grading-rubric" className="whitespace-pre-wrap">
                      {syllabusInfo.grading_rubric}
                    </p>
                  </div>
                  : <div>
                    <h2 className={`${kurintoSerif.className} font-bold text-lg mb-2`}>Grading rubric</h2>
                    <p className="text-sm text-gray-400 whitespace-pre-wrap">
                      No grading rubric.
                    </p>
                  </div>}

                {syllabusInfo.assignments ?
                  <div>
                    <h2 className={`${kurintoSerif.className} font-bold text-lg mb-2`}>Assignments</h2>
                    <ul data-cy="course-assignments" className="whitespace-pre-wrap">
                      {syllabusInfo.assignments.map((r, i) => (
                        <li key={`assignments-${i}`}>{r}</li>
                      ))}
                    </ul>
                  </div>
                  : <div>
                    <h2 className={`${kurintoSerif.className} font-bold text-lg mb-2`}>Assignments</h2>
                    <p className="text-sm text-gray-400 whitespace-pre-wrap">
                      No assignments.
                    </p>
                  </div>}

                  {syllabusInfo.other ?
                  <div>
                    <h2 className={`${kurintoSerif.className} font-bold text-lg mb-2`}>Other</h2>
                    <p data-cy="course-other" className="whitespace-pre-wrap">
                      {syllabusInfo.other}
                    </p>
                  </div>
                  : <div>
                    <h2 className={`${kurintoSerif.className} font-bold text-lg mb-2`}>Other</h2>
                    <p className="text-sm text-gray-400 whitespace-pre-wrap">
                      No other coment.
                    </p>
                  </div>}


                <hr className="border-gray-600 my-8" />
                <SyllabusAttachments attachments={syllabusInfo.attachments} />
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
              <>
                <Link href={`/edit-syllabus?sid=${syllabusInfo.uuid}`} className="mt-3 flex p-2 rounded-md gap-3 border border-gray-900" >
                  <Image src={editIcon} width="24" height="24" alt="Icon to edit the name" />
                  <div>Edit syllabus</div>
                </Link>
                <button onClick={() => setShowDeleteModal(true)} className="mt-3 flex p-2 bg-red-400 hover:bg-red-500 text-white rounded-md gap-3" >
                  <Image src={deleteIcon} width="24" height="24" alt="Icon to delete the syllabus" />
                  <div>Delete syllabus</div>
                </button>
              </>
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
