import type { NextPage } from "next";
import { useRouter } from "next/router";
import Head from "next/head";

import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";

import { GlobalNav } from "components/GlobalNav";
import SyllabusBreadcrumbs from "components/SyllabusBreadcrumbs";
import SyllabusSchoolCodeYear from "components/Syllabus/SyllabusSchoolCodeYear";
import SyllabusResources from "components/Syllabus/SyllabusResources";
import SyllabusFooter from "components/Syllabus/SyllabusFooter";
import Tags from "components/Tags";

interface ISyllabusProps {
  title: string;
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
}

const Syllabus: NextPage = () => {
  const router = useRouter();
  const { sid } = router.query;

  const props = {
    ID: 1,
    created_at: "2022-08-19T13:02:01.848457Z",
    updated_at: "2022-08-19T13:02:01.868188Z",
    deleted_at: null,
    uuid: "46de6a2b-aacb-4c24-b1e1-3495821f846a",
    status: "unlisted",
    user_uuid: "e7b74bcd-c864-41ee-b5a7-d3031f76c8a8",
    user: {
      ID: 1,
      created_at: "2022-08-19T13:02:01.84418Z",
      updated_at: "2022-08-19T13:02:01.84418Z",
      deleted_at: null,
      uuid: "e7b74bcd-c864-41ee-b5a7-d3031f76c8a8",
      status: "confirmed",
      bio: "Justyna Poplawska is a guest lecturer at the Technisches Universität Berlin, in the chair of Jacob Van Rijs. She leads design and competition seminars.",
      education: "MA in Architecture, TU Cottbus",
      email: "jus@pop.com",
      name: "Justyna Poplawska",
      password:
        "JDJhJDEwJHlINU9uTDNiOXBQUTUxaDZkSnk2T2UvdXdOTDlna2RYM1pvSUtQdXE5aEVmZ1VDM0k4WHFD",
      urls: ["http://jus.net", "http://pop.com"],
      institutions: null,
      collections: null,
      syllabi: null,
    },
    collections: null,
    attachments: [
      {
        ID: 1,
        created_at: "2022-08-19T13:02:01.85043Z",
        updated_at: "2022-08-19T13:02:01.85043Z",
        deleted_at: null,
        uuid: "c55f0baf-12b8-4bdb-b5e6-2280bff8ab21",
        syllabus_uuid: "46de6a2b-aacb-4c24-b1e1-3495821f846a",
        syllabus: {
          ID: 0,
          created_at: "0001-01-01T00:00:00Z",
          updated_at: "0001-01-01T00:00:00Z",
          deleted_at: null,
          uuid: "00000000-0000-0000-0000-000000000000",
          status: "",
          user_uuid: "00000000-0000-0000-0000-000000000000",
          user: {
            ID: 0,
            created_at: "0001-01-01T00:00:00Z",
            updated_at: "0001-01-01T00:00:00Z",
            deleted_at: null,
            uuid: "00000000-0000-0000-0000-000000000000",
            status: "",
            bio: "",
            education: "",
            email: "",
            name: "",
            password: null,
            urls: null,
            institutions: null,
            collections: null,
            syllabi: null,
          },
          collections: null,
          attachments: null,
          institutions: null,
          academic_fields: null,
          academic_level: 0,
          assignments: null,
          description: "",
          duration: 0,
          grading_rubric: "",
          language: "",
          learning_outcomes: null,
          other: "",
          readings: null,
          tags: null,
          title: "",
          topic_outlines: null,
        },
        name: "Chair website",
        type: "",
        description: "",
        url: "https://fg.vanr.tu-berlin.de/ungewohnt/",
      },
      {
        ID: 2,
        created_at: "2022-08-19T13:02:01.85043Z",
        updated_at: "2022-08-19T13:02:01.85043Z",
        deleted_at: null,
        uuid: "c55f0baf-12b8-4bdb-b5e6-2280bff8ab30",
        syllabus_uuid: "46de6a2b-aacb-4c24-b1e1-3495821f846a",
        syllabus: {
          ID: 0,
          created_at: "0001-01-01T00:00:00Z",
          updated_at: "0001-01-01T00:00:00Z",
          deleted_at: null,
          uuid: "00000000-0000-0000-0000-000000000000",
          status: "",
          user_uuid: "00000000-0000-0000-0000-000000000000",
          user: {
            ID: 0,
            created_at: "0001-01-01T00:00:00Z",
            updated_at: "0001-01-01T00:00:00Z",
            deleted_at: null,
            uuid: "00000000-0000-0000-0000-000000000000",
            status: "",
            bio: "",
            education: "",
            email: "",
            name: "",
            password: null,
            urls: null,
            institutions: null,
            collections: null,
            syllabi: null,
          },
          collections: null,
          attachments: null,
          institutions: null,
          academic_fields: null,
          academic_level: 0,
          assignments: null,
          description: "",
          duration: 0,
          grading_rubric: "",
          language: "",
          learning_outcomes: null,
          other: "",
          readings: null,
          tags: null,
          title: "",
          topic_outlines: null,
        },
        name: "Final presentations",
        type: "",
        description: "",
        url: "https://fg.vanr.tu-berlin.de/ungewohnt-endpraesentation/",
      },
      {
        ID: 3,
        created_at: "2022-08-19T13:02:01.85043Z",
        updated_at: "2022-08-19T13:02:01.85043Z",
        deleted_at: null,
        uuid: "c55f0baf-12b8-4bdb-b5e6-2280bff8ab49",
        syllabus_uuid: "46de6a2b-aacb-4c24-b1e1-3495821f846a",
        syllabus: {
          ID: 0,
          created_at: "0001-01-01T00:00:00Z",
          updated_at: "0001-01-01T00:00:00Z",
          deleted_at: null,
          uuid: "00000000-0000-0000-0000-000000000000",
          status: "",
          user_uuid: "00000000-0000-0000-0000-000000000000",
          user: {
            ID: 0,
            created_at: "0001-01-01T00:00:00Z",
            updated_at: "0001-01-01T00:00:00Z",
            deleted_at: null,
            uuid: "00000000-0000-0000-0000-000000000000",
            status: "",
            bio: "",
            education: "",
            email: "",
            name: "",
            password: null,
            urls: null,
            institutions: null,
            collections: null,
            syllabi: null,
          },
          collections: null,
          attachments: null,
          institutions: null,
          academic_fields: null,
          academic_level: 0,
          assignments: null,
          description: "",
          duration: 0,
          grading_rubric: "",
          language: "",
          learning_outcomes: null,
          other: "",
          readings: null,
          tags: null,
          title: "",
          topic_outlines: null,
        },
        name: "Assignment 1 - City analysis",
        type: "",
        description: "",
        url: "https://fg.vanr.tu-berlin.de/ungewohnt-uebung-1-1-fokussieren/",
      },
    ],
    institutions: [
      {
        ID: 2,
        created_at: "2022-08-19T13:02:01.869059Z",
        updated_at: "2022-08-19T13:02:01.869059Z",
        deleted_at: null,
        uuid: "462d8c8d-d43d-4641-8fa0-fca8427a1435",
        name: "Sciences Po",
        country: 250,
        date: {
          term: "",
          year: 0,
        },
        url: "",
        position: "lecturer",
      },
    ],
    academic_fields: [100, 200],
    academic_level: 1,
    assignments: null,
    description:
      "Nach einem Semester im unbewohnten Berliner Umland kehren wir zurück in die Stadt. Eine Stadt, in der uns vieles bekannt und selbstverständlich vorkommt. Mit dem Beginn des Architekturstudiums verändert sich die Sichtweise auf unser gewohntes Umfeld grundlegend.\nDas Beobachten, Analysieren und Hinterfragen von städtischen Phänomenen, Strukturen, Ordnungen und Systemen führt uns zu einem neuen Verständnis von geplantem städtischem Raum und wir entwickeln eine Sensibilität für die Schönheit des vermeintlich Belanglosen.\nWir brechen mit Gewohntem, hinterfragen und suchen nach unbeschrittenen Wegen. Wir halten den Blick offen für Neues und schaffen Raum für neue Ideen. Im Spannungsfeld zwischen der Kraft des Gewohnten und der Dynamik des Experimentellen.",
    duration: 14,
    grading_rubric: "",
    language: "de",
    learning_outcomes: null,
    other: "",
    readings: null,
    tags: ["natur", "architektur", "vorkurs"],
    title: "Ungewohnt",
    topic_outlines: null,
  };

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
              instructors={props.user.name}
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
