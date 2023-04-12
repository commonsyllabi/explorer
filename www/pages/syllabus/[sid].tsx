import type { GetServerSideProps, NextPage } from "next";
import { useRouter } from "next/router";
import Head from "next/head";

import { ICollection, ISyllabus } from "types";

import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

import Favicons from "components/head/favicons";
import GlobalNav from "components/GlobalNav";
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
import { useSession } from "next-auth/react";
import { useState } from "react";
import AddToCollection from "components/Collection/AddToCollection";

import type { GetServerSidePropsContext } from "next"
import { getToken } from "next-auth/jwt";

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
  if (syll_res.ok){
    const data = await syll_res.json();
    syllInfo = data as ISyllabus;
  }else{
    syllInfo = {} as ISyllabus
  }

  //-- if logged in, get user collections
  const coll_res = await fetch(userUrl, { headers: h });
  if (coll_res.ok){
    const data = await coll_res.json();
    collInfo = data.collections ? data.collections as ICollection[] : [] as ICollection[];
  }else{
    collInfo = [] as ICollection[]
  }

  if(syll_res.ok)
    return {
      props: {
        syllabusInfo: syllInfo,
        userCollections: collInfo,
      }
    }
  else
    return{
      props: {}
    }
};

interface ISyllabusPageProps {
  syllabusInfo: ISyllabus,
  userCollections: ICollection[]
}

const Syllabus: NextPage<ISyllabusPageProps> = ({syllabusInfo, userCollections}) => {
  const router = useRouter();
  const { sid } = router.query;
  const { data: session } = useSession()
  const [isAddingToCollection, showIsAddingToCollection] = useState(false)
  

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
          content={`${syllabusInfo.title} by ${syllabusInfo.user.name} on Cosyll| ${syllabusInfo.description}`}
        />
        <Favicons />
      </Head>

      <Container
        fluid
        id="header-section"
        className="container-fluid sticky-top"
      >
        <GlobalNav />
        <BreadcrumbsBar
          user={syllabusInfo.user.name}
          userId={syllabusInfo.user.uuid}
          category="syllabi"
          pageTitle={syllabusInfo.title}
        />
      </Container>

      <Container>
        <Row className="flex justify-content-center">
          <Col className="pt-3 pb-5 flex flex-column gap-3" lg={10}>
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
            <Col className="pt-3 pb-5 flex flex-column gap-3" lg={10}>

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

      </Container>
    </>
  );
};

export default Syllabus;
