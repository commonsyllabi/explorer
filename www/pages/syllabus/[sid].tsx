import type { GetServerSideProps, NextPage } from "next";
import { useRouter } from "next/router";
import Head from "next/head";

import { ISyllabus } from "types";

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

export const getServerSideProps: GetServerSideProps = async (context) => {
  const syllabusId = context.params!.sid;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const url = new URL(`syllabi/${syllabusId}`, apiUrl);

  const res = await fetch(url);
  if (res.ok) {
    const syllabusInfo = await res.json();
    return {
      props: syllabusInfo,
    };
  } else {
    return {
      props: {},
    };
  }
};

const Syllabus: NextPage<ISyllabus> = (props) => {
  const router = useRouter();
  const { sid } = router.query;

  if (Object.keys(props).length === 0) {
    return (
     <NotFound/>
    )
  }

  return (
    <>
      <Head>
        <title>{props.title}</title>
        <meta
          name="description"
          content={`${props.title} by ${props.user.name} on Cosyll| ${props.description}`}
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
          user={props.user.name}
          userId={props.user.uuid}
          category="syllabi"
          pageTitle={props.title}
        />
      </Container>

      <Container>
        <Row className="d-flex justify-content-center">
          <Col className="pt-3 pb-5 d-flex flex-column gap-3" lg={10}>
            <SyllabusHeader
              institution={getInstitutionName(props.institutions)}
              courseNumber={props.course_number}
              level={props.academic_level}
              fields={props.academic_fields}
              year={getInstitutionYearInfo(props.institutions)}
              term={getInstitutionTermInfo(props.institutions)}
            />
            <h1 className="p-0 m-0">
              {props.title ? props.title : "Course Title"}
            </h1>
            <p className="course-instructors p-0 m-0">
              by <Link href={`/user/${props.user.uuid}`}>
                {props.user ? props.user.name : "Course Author / Instructor"}
              </Link>
            </p>

            <div className="course-tags d-flex gap-2">
              {props.tags ? (
                <Tags tags={props.tags} />
              ) : (
                <Tags tags={["tag 1", "tag 2", "tag 3"]} />
              )}
            </div>
            <h2 className="h3">Course Overview</h2>
            <p className="course-description" style={{whiteSpace: 'pre-wrap'}}>
              {props.description
                ? props.description
                : "Course description goes here..."}
            </p>
            <h2 className="h3">Course Resources</h2>
            <SyllabusResources resources={props.attachments} />
            <SyllabusFooter
              author={props.user.name}
              authorUUID={props.user.uuid}
              uploadDate={props.created_at}
            />
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default Syllabus;
