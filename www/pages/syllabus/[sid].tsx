import type { GetServerSideProps, GetServerSidePropsContext, NextPage } from "next";
import { useRouter } from "next/router";
import Head from "next/head";
import { getToken } from "next-auth/jwt";
import { useSession } from "next-auth/react";
import Image from "next/image";

import { ICollection, ISyllabus } from "types";

import BreadcrumbsBar from "components/commons/BreadcrumbsBar";
import SyllabusAttachments from "components/Syllabus/SyllabusAttachments";
import NotFound from "components/commons/NotFound";
import Link from "next/link";

import SyllabusHeader from "components/Syllabus/SyllabusHeader";
import { useState } from "react";
import AddToCollection from "components/Collection/AddToCollection";
import addCircleIcon from '../../public/icons/add-circle-line.svg'
import deleteIcon from '../../public/icons/delete-bin-line.svg'
import editIcon from '../../public/icons/edit-box-line.svg'
import { kurintoSerif } from "app/layout";
import SyllabusDelete from "components/Syllabus/SyllabusDelete";
import Modal from "components/commons/Modal";
import SyllabusTitle from "components/Syllabus/SyllabusTitle";
import SyllabusTags from "components/Syllabus/SyllabusTags";
import SyllabusListFormField from "components/Syllabus/SyllabusListFormField";
import SyllabusTextFormField from "components/Syllabus/SyllabusTextFormField";

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
  const apiUrl = new URL(`/syllabi/${syllabusInfo.uuid}`, process.env.NEXT_PUBLIC_API_URL)

  const checkIfAdmin = () => {
    if (session != null && session.user != null) {
      return session.user._id === syllabusInfo.user_uuid;
    }
    return false
  };

  const getDate = (_d: string) => {
    const d = new Date(_d)

    return `${d.getFullYear()}-${d.getMonth() + 1 < 10 ? '0' + (d.getMonth() + 1) : (d.getMonth() + 1)}-${d.getDate() < 10 ? '0' + d.getDate() : d.getDate()}`
  }

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

        <div className="flex mt-8">
          <div className="w-full pt-3 pb-5 flex flex-col gap-3">
            <SyllabusHeader syllabusInfo={syllabusInfo} />

            <SyllabusTitle syllabusTitle={syllabusInfo.title} isAdmin={checkIfAdmin()} apiUrl={apiUrl} />

            <div className="text-sm">Uploaded by <Link href={`/user/${syllabusInfo.user.uuid}`} className={`${kurintoSerif.className} text-base hover:underline`} data-cy="courseInstructors">
              {syllabusInfo.user ? syllabusInfo.user.name : "Course Author / Instructor"}
            </Link> on {getDate(syllabusInfo.created_at)}
            </div>

            <SyllabusTags syllabusTags={syllabusInfo.tags as string[]} apiUrl={apiUrl} isAdmin={checkIfAdmin()} />

            <div className="flex flex-col gap-5">
              <SyllabusTextFormField label="Description" info={syllabusInfo.description} apiUrl={apiUrl} isAdmin={checkIfAdmin()} />

              <SyllabusListFormField label="Learning Outcomes" info={syllabusInfo.learning_outcomes as string[]} apiUrl={apiUrl} isAdmin={checkIfAdmin()} />

              <SyllabusListFormField label="Topic Outlines" info={syllabusInfo.topic_outlines as string[]} apiUrl={apiUrl} isAdmin={checkIfAdmin()} />

              <SyllabusListFormField label="Readings" info={syllabusInfo.readings as string[]} apiUrl={apiUrl} isAdmin={checkIfAdmin()} />

              <SyllabusTextFormField label="Grading Rubric" info={syllabusInfo.grading_rubric as string} apiUrl={apiUrl} isAdmin={checkIfAdmin()} />

              <SyllabusListFormField label="Assignments" info={syllabusInfo.assignments as string[]} apiUrl={apiUrl} isAdmin={checkIfAdmin()} />

              <SyllabusTextFormField label="Other" info={syllabusInfo.other as string} apiUrl={apiUrl} isAdmin={checkIfAdmin()} />

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
    </>
  );
};

export default Syllabus;
