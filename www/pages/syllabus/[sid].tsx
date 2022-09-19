import type { GetServerSideProps, NextPage } from "next";
import { useRouter } from "next/router";
import Head from "next/head";

import { IResources, ISyllabus } from "types";

import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

import Favicons from "components/head/favicons";
import GlobalNav from "components/GlobalNav";
import BreadcrumbsBar from "components/BreadcrumbsBar";
import SyllabusBreadcrumbs from "components/SyllabusBreadcrumbs";
import SyllabusSchoolCodeYear from "components/Syllabus/SyllabusSchoolCodeYear";
import SyllabusResources from "components/Syllabus/SyllabusResources";
import SyllabusFooter from "components/Syllabus/SyllabusFooter";
import Tags from "components/Tags";
import Link from "next/link";

interface ISyllabusProps {
  info: {
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
    user_uuid: string;
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
  };
  apiUrl: string;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const syllabusId = context.params!.sid;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const url = new URL(`syllabi/${syllabusId}`, apiUrl);

  console.log(`SYLLABUS ID: ${syllabusId}`);
  console.log(`API URL: ${apiUrl}`);
  console.log(`FETCH URL: ${url}`);

  const res = await fetch(url);
  const syllabusInfo = await res.json();

  // console.log(userInfo);

  return {
    props: {
      info: syllabusInfo,
      apiUrl: apiUrl,
    },
  };
};

const Syllabus: NextPage<ISyllabusProps> = (props) => {
  const router = useRouter();
  const { sid } = router.query;

  return (
    <>
      <Head>
        <title>{props.info.title}</title>
        <meta
          name="description"
          content={`${props.info.title} by ${props.info.user.name} on Syllabi Explorer| ${props.info.description}`}
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
          user={props.info.user.name}
          userId={props.info.user_uuid}
          category="syllabi"
          pageTitle={props.info.title}
        />
      </Container>

      <Container>
        <Row className="d-flex justify-content-center">
          <Col className="pt-3 pb-5 d-flex flex-column gap-3" lg={10}>
            <SyllabusSchoolCodeYear
              institution="Parson The New School of Design"
              courseNumber="PSAM1028"
              year="Spring 2019"
            />
            <h1 className="p-0 m-0">
              {props.info.title ? props.info.title : "Course Title"}
            </h1>
            <p className="small text-muted mb-0">ID: {sid}</p>
            <p className="course-instructors p-0 m-0">
              <Link href={`/user/${props.info.user.uuid}`}>
                {props.info.user
                  ? props.info.user.name
                  : "Course Author / Instructor"}
              </Link>
            </p>

            <div className="course-tags d-flex gap-2">
              {props.info.tags ? (
                <Tags tags={props.info.tags} />
              ) : (
                <Tags tags={["tag 1", "tag 2", "tag 3"]} />
              )}
            </div>
            <h2 className="h3">Course Overview</h2>
            <p className="course-description">
              {props.info.description
                ? props.info.description
                : "Course description goes here..."}
            </p>
            <h2 className="h3">Course Resources</h2>
            <SyllabusResources
              resources={props.info.attachments}
              apiUrl={props.apiUrl}
            />
            <SyllabusFooter
              author={props.info.user.name}
              authorUUID={props.info.user.uuid}
              uploadDate={props.info.created_at}
            />
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default Syllabus;
