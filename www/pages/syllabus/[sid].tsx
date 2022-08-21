import type { GetServerSideProps, NextPage } from "next";
import { useRouter } from "next/router";
import Head from "next/head";

import { IResources, ISyllabus } from "types";

import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

import { GlobalNav } from "components/GlobalNav";
import SyllabusBreadcrumbs from "components/SyllabusBreadcrumbs";
import SyllabusSchoolCodeYear from "components/Syllabus/SyllabusSchoolCodeYear";
import SyllabusResources from "components/Syllabus/SyllabusResources";
import SyllabusFooter from "components/Syllabus/SyllabusFooter";
import Tags from "components/Tags";

interface ISyllabusProps {
  title: string;
  created_at: string;
  institutions: [
    {
      uuid: string;
      name: string;
      country: number;
      date: {
        term: string;
        year: string;
      };
      url: string;
      position: string;
    }
  ];
  academic_fields: number[];
  user: {
    uuid: string;
    name: string;
  };
  tags: string[];
  description: string;
  resources: [
    {
      uuid: string;
      name: string;
      description: string;
      url: string;
      type: string;
    }
  ];
  learning_outcomes: string;
  attachments: IResources[];
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const syllabusId = context.params!.sid;
  const apiUrl = process.env.API_URL;
  const url = apiUrl + "syllabi/" + syllabusId;

  console.log(`SYLLABUS ID: ${syllabusId}`);
  console.log(`API URL: ${apiUrl}`);
  console.log(`FETCH URL: ${url}`);

  const res = await fetch(url);
  const syllabusInfo = await res.json();

  // console.log(userInfo);

  return {
    props: syllabusInfo,
  };
};

const Syllabus: NextPage<ISyllabusProps> = (props) => {
  const router = useRouter();
  const { sid } = router.query;

  return (
    <>
      <Head>
        <title>Web Design Basics</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Container>
        <div id="header-section" className="sticky-top">
          <GlobalNav />
          <SyllabusBreadcrumbs />
        </div>
      </Container>

      <Container>
        <Row className="d-flex justify-content-center">
          <Col className="pt-3 pb-5 d-flex flex-column gap-3" lg={10}>
            <SyllabusSchoolCodeYear
              institution="Parson The New School of Design"
              code="PSAM1028"
              year="Spring 2019"
            />
            <h1 className="p-0 m-0">
              {props.title ? props.title : "Course Title"}
            </h1>
            <p className="small text-muted mb-0">ID: {sid}</p>
            <p className="course-instructors p-0 m-0">
              {props.user ? props.user.name : "Course Author / Instructor"}
            </p>

            <div className="course-tags d-flex gap-2">
              {props.tags ? (
                <Tags tags={props.tags} />
              ) : (
                <Tags tags={["tag 1", "tag 2", "tag 3"]} />
              )}
            </div>
            <h2 className="h3">Course Overview</h2>
            <p className="course-description">
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
