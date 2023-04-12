import type { GetServerSideProps, NextPage } from "next";
import { useRouter } from "next/router";
import Head from "next/head";

import { ICollection, ISyllabus } from "types";

import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

import BreadcrumbsBar from "components/BreadcrumbsBar";
import SyllabusResources from "components/Syllabus/SyllabusResources";
import SyllabusFooter from "components/Syllabus/SyllabusFooter";
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

import type { GetServerSidePropsContext } from "next"
import { getToken } from "next-auth/jwt";
import { signOut, useSession } from "next-auth/react";
import Router from "next/router";

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
      props: {}
    }
};

interface ISyllabusPageProps {
  syllabusInfo: ISyllabus,
  userCollections: ICollection[]
}

const Syllabus: NextPage<ISyllabusPageProps> = ({ syllabusInfo, userCollections }) => {
  const router = useRouter();
  const { sid } = router.query;
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

  const deleteSyllabus = () => {
    const h = new Headers();
    h.append("Authorization", `Bearer ${session?.user.token}`);

    fetch(new URL(`/syllabi/${syllabusInfo.uuid}`, process.env.NEXT_PUBLIC_API_URL),
      {
        method: 'DELETE',
        headers: h
      })
      .then(res => {
        if (res.ok) {
          setModalMessage(`${syllabusInfo.title} was successfully deleted!`)
        } else if (res.status == 401) {
          signOut({ redirect: false }).then((result) => {
            Router.push("/auth/signin");
          })
          return res.text()
        } else {
          return res.text()
        }
      })
      .then(body => {
        setModalMessage(`There was an error deleting your syllabus (${body}). Please try again later.`)
      })
  }

  return (
    <>
      <Head>
        <title>{`Cosyll | ${syllabusInfo.title}`}</title>
        <meta
          name="description"
          content={`${syllabusInfo.title} by ${syllabusInfo.user.name} on Cosyll| ${syllabusInfo.description}`}
        />

      </Head>

      <Container
        fluid
        id="header-section"
        className="container-fluid sticky-top"
      >

        <BreadcrumbsBar
          user={syllabusInfo.user.name}
          userId={syllabusInfo.user.uuid}
          category="syllabi"
          pageTitle={syllabusInfo.title}
        />
      </Container>

      {showDeleteModal ? <div className="flex flex-col justify-between border border-black absolute bg-white p-5 w-full h-full">
        <h2>Watch out!</h2>
        <div>You are about to delete <b>{syllabusInfo.title}</b>.</div>
        <div>{modalMessage}</div>
        <div className="flex justify-content-between mt-3">
          <button onClick={() => setShowDeleteModal(false)}>close</button>
          <button onClick={deleteSyllabus} disabled={modalMessage !== ""}>delete</button>
        </div>
      </div>
        : <></>}

      <Container>
        <Row className="flex justify-content-center">
          <Col className="pt-3 pb-5 flex flex-col gap-3" lg={10}>
            <SyllabusHeader
              institution={getInstitutionName(syllabusInfo.institutions)}
              courseNumber={syllabusInfo.course_number}
              level={syllabusInfo.academic_level}
              fields={syllabusInfo.academic_fields}
              year={getInstitutionYearInfo(syllabusInfo.institutions)}
              term={getInstitutionTermInfo(syllabusInfo.institutions)}
            />
            <h1 className="p-0 m-0">
              {syllabusInfo.title ? syllabusInfo.title : "Course Title"}
            </h1>
            <p className="course-instructors p-0 m-0">
              by <Link href={`/user/${syllabusInfo.user.uuid}`}>
                {syllabusInfo.user ? syllabusInfo.user.name : "Course Author / Instructor"}
              </Link>
            </p>

            <div className="course-tags flex gap-2">
              {syllabusInfo.tags ? (
                <Tags tags={syllabusInfo.tags} />
              ) : (
                <Tags tags={["tag 1", "tag 2", "tag 3"]} />
              )}
            </div>
            <h2 className="h3">Course Overview</h2>
            <p className="course-description" style={{ whiteSpace: 'pre-wrap' }}>
              {syllabusInfo.description
                ? syllabusInfo.description
                : "Course description goes here..."}
            </p>
            <h2 className="h3">Course Resources</h2>
            <SyllabusResources resources={syllabusInfo.attachments} />
            <SyllabusFooter
              author={syllabusInfo.user.name}
              authorUUID={syllabusInfo.user.uuid}
              uploadDate={syllabusInfo.created_at}
            />
          </Col>
        </Row>
        {session ?
          <Row className="flex justify-content-center">
            <Col className="pt-3 pb-5 flex flex-col gap-3" lg={10}>

              <button onClick={() => showIsAddingToCollection(true)}>add to collection</button>
            </Col>
          </Row>
          :
          <></>
        }
        {isAddingToCollection ?
          <AddToCollection collections={userCollections} syllabusInfo={syllabusInfo} handleClose={() => showIsAddingToCollection(false)} />
          :
          <></>}
        {checkIfAdmin() ? <div className="controls mt-3 flex justify-content-end">
          <button onClick={() => setShowDeleteModal(true)}>Delete</button>
        </div> : <></>}

      </Container>
    </>
  );
};

export default Syllabus;
