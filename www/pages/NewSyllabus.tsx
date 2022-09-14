import { useState, useEffect, FormEvent } from "react";
import type { GetStaticProps, NextPage } from "next";
import { getSession, useSession } from "next-auth/react";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";

import { GlobalNav } from "components/GlobalNav";

import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import { FormSelect } from "react-bootstrap";
import Badge from "react-bootstrap/Badge";
import { getToken } from "next-auth/jwt";

export const getStaticProps: GetStaticProps = async () => {
  const apiUrl = new URL(`syllabi/`, process.env.API_URL);

  console.log(`GetStaticProps API URL: ${apiUrl.href}`);

  const adminKey = process.env.ADMIN_KEY;

  return {
    props: { apiUrl: apiUrl.href, adminKey: adminKey },
  };
};

interface INewSyllabus {
  apiUrl: URL;
  adminKey: String;
}

const NewSyllabus: NextPage<INewSyllabus> = (props) => {
  const { data: session, status } = useSession();

  const [validated, setValidated] = useState(true);
  useEffect(() => setValidated(true), []);

  const [testFormData, setTestFormData] = useState({
    title: "My 101 Class",
    description: "My beautiful class description.",
    "tag[]": "Banana",
  });

  const [formData, setFormData] = useState({
    institutions: [],
    title: "",
    course_number: "",
    description: "",
    attachments: [],
    tags: [],
    language: "",
    learning_outcomes: [],
    topic_outlines: [],
    readings: [],
    grading_rubric: "",
    assignments: [],
    other: "",
    status: "unlisted",
    academic_fields: [],
    academic_level: 0,
  });

  const [log, setLog] = useState("");
  const [error, setError] = useState("");
  const [isCreated, setCreated] = useState(false);

  const apiUrl = props.apiUrl;

  const handleSubmit = async (
    event: React.FormEvent<HTMLInputElement>
  ): void => {
    event.preventDefault();
    event.stopPropagation();

    console.log("handleSubmit() called");
    console.log(`Session details:${JSON.stringify(session)}`);
    const form = event.currentTarget;

    // TODO: validate form
    // if (form.checkValidity() === false) {
    //   event.preventDefault();
    //   event.stopPropagation();
    // }
    // setValidated(true);

    const postHeader = new Headers();
    postHeader.append("Content-Type", "application/json; charset=UTF-8");
    // h.append("Authorization");

    let formData = new FormData();

    for (let [key, value] of Object.entries(testFormData)) {
      formData.append(key, value);
    }

    fetch(new URL(`?token=${props.adminKey}`, props.apiUrl), {
      method: "POST",
      header: postHeader,
      body: formData,
    })
      .then((res) => {
        if (res.status == 201) {
          console.log("SUCCESS, syllabus created.");
          setCreated(true);
        } else {
          console.log(`Error: ${console.log(res)}`);
        }
      })
      .then((body) => {
        if (body) {
          console.log(body);
          console.log(body.Detail);
          // setError(body.Detail);
        } else {
          console.log("NO BODY.");
        }
      })
      .catch((err) => {
        console.error(`Error: ${err}`);
      });

    if (validated) {
      //send post request
    }
  };

  const addAttachment = (event: React.SyntheticEvent): void => {
    event.preventDefault();
    event.stopPropagation();
    console.log("Attachment added");
  };

  //Handle form change
  const handleChange = (event: React.SyntheticEvent) => {
    if (event.target.id === "status") {
      //handle public/private toggle
      const newStatus = formData.status === "unlisted" ? "listed" : "unlisted";
      setFormData({ ...formData, [event.target.id]: newStatus });
    } else {
      setFormData({ ...formData, [event.target.id]: event.target.value });
    }
    console.log(`${[event.target.id]}: ${event.target.value}`);
  };

  //Get public/private form label
  const getPublicPrivateLabel = (status) => {
    if (status === "unlisted") {
      return "Private (only viewable to you)";
    } else {
      return "Public (anyone can view)";
    }
  };

  //if user is logged in, show form
  if (status === "authenticated") {
    return (
      <>
        <Head>
          <title>New Syllabus</title>
          <meta name="description" content="Create a new syllabus" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <Container>
          <div id="header-section" className="sticky-top">
            <GlobalNav />
          </div>

          <Container>
            <Row className="pt-3 pb-3">
              <Col className="col-8 offset-2">
                <h1 className="h3">New Syllabus</h1>
              </Col>
            </Row>
            <Row className="gap-3 pb-5">
              <Col className="col-8 offset-2">
                <p className="small text-muted mb-3">
                  Signed in as {session.user.name} ({session.user.email}).
                </p>
                <Form noValidate validated={false} onSubmit={handleSubmit}>
                  <fieldset>
                    <Form.Group className="mb-3">
                      <Form.Label htmlFor="courseTitle">
                        Course Title
                      </Form.Label>
                      <Form.Control
                        required
                        id="title"
                        placeholder="Web Design History"
                        onChange={handleChange}
                        value={formData.title}
                      />
                      <Form.Control.Feedback type="invalid">
                        Please provide a valid course title.
                      </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Check
                      type="switch"
                      className="mb-3"
                      onChange={handleChange}
                    >
                      <Form.Check.Input
                        id="status"
                        onChange={handleChange}
                        value={formData.status}
                      />
                      <Form.Check.Label>
                        {getPublicPrivateLabel(formData.status)}
                      </Form.Check.Label>
                    </Form.Check>

                    {/* //TODO make add institution work */}
                    <Form.Group className="mb-1">
                      <Form.Label htmlFor="institution">Institution</Form.Label>
                      <Form.Select id="institution" disabled>
                        <option>select institution</option>
                      </Form.Select>
                    </Form.Group>
                    <Button variant="secondary" className="mb-3" disabled>
                      + Add New Institution
                    </Button>

                    <Form.Group className="mb-3">
                      <Form.Label htmlFor="courseCode">
                        Course Number
                      </Form.Label>
                      <div className="col-4">
                        <Form.Control
                          id="course_number"
                          placeholder="CS101"
                          onChange={handleChange}
                          value={formData.course_number}
                        />
                      </div>
                    </Form.Group>

                    <Form.Group className="mb-5">
                      <Form.Label htmlFor="academic_level" className="mb-0">
                        Academic Level
                      </Form.Label>
                      <Form.Select
                        id="academic_level"
                        onChange={handleChange}
                        value={formData.academic_level}
                      >
                        <option value="0">Other</option>
                        <option value="1">Bachelor</option>
                        <option value="2">Master</option>
                        <option value="3">Doctoral</option>
                      </Form.Select>
                    </Form.Group>

                    <div className="d-flex gap-3">
                      <Form.Group className="col-3 mb-3">
                        <Form.Label htmlFor="courseYear">Year</Form.Label>
                        <Form.Control id="courseYear" placeholder="2022" />
                      </Form.Group>

                      <Form.Group className="col-3 mb-3">
                        <Form.Label htmlFor="courseTerm">Term</Form.Label>
                        <Form.Control
                          id="courseTerm"
                          placeholder="Spring Semester"
                        />
                      </Form.Group>
                    </div>

                    <Form.Group className="mb-3">
                      <Form.Label htmlFor="courseLanguage">Language</Form.Label>

                      <Form.Select id="courseLanguage">
                        <option>—</option>
                      </Form.Select>
                      <Form.Text>
                        The language this class is primarily taught in.
                      </Form.Text>
                    </Form.Group>

                    <div className="d-flex gap-3">
                      <Form.Group className="mb-3">
                        <Form.Label htmlFor="duration">
                          Duration of course in weeks
                        </Form.Label>
                        <Form.Control id="durcation" placeholder="3" />
                      </Form.Group>
                    </div>

                    <hr className="my-3" />

                    <Form.Group className="mb-3">
                      <Form.Label htmlFor="courseDescription">
                        Description*
                      </Form.Label>
                      <Form.Control
                        required
                        id="courseDescription"
                        as="textarea"
                        rows={4}
                        placeholder="Course outline..."
                      />
                      <Form.Control.Feedback type="invalid">
                        Please provide a brief description of the course.
                      </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label htmlFor="learning_outcomes">
                        Learning Outcomes
                      </Form.Label>
                      <Form.Control
                        id="learning_outcomes"
                        as="textarea"
                        rows={4}
                        placeholder="Course learning outcomes..."
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label htmlFor="topic_outlines">
                        Topics Outline
                      </Form.Label>
                      <Form.Control
                        id="topic_outlines"
                        as="textarea"
                        rows={4}
                        placeholder="Course topics outline..."
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label htmlFor="readings">Readings</Form.Label>
                      <Form.Control
                        id="readings"
                        as="textarea"
                        rows={4}
                        placeholder="Course readings..."
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label htmlFor="grading_rubric">
                        Grading Rubric
                      </Form.Label>
                      <Form.Control
                        id="grading_rubric"
                        as="textarea"
                        rows={4}
                        placeholder="Course grading rubric..."
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label htmlFor="assignments">
                        Grading Rubric
                      </Form.Label>
                      <Form.Control
                        id="assignments"
                        as="textarea"
                        rows={4}
                        placeholder="Course assignments..."
                      />
                    </Form.Group>

                    <hr className="my-3" />
                    {/* TODO: Make attachments work */}
                    <div className="mb-5">
                      <h2 className="h4">Attachments</h2>
                      <div className="course-attachments p-3 mb-3 border rounded bg-light">
                        <div className="attachment-item">
                          <h4 className="h5">AttachmentName.pdf</h4>
                          <div className="d-flex">
                            <p className="mb-0">Size: 3.5mb</p>
                            <p className="mx-3">|</p>
                            <p>
                              Type: <Badge bg="secondary">PDF</Badge>
                            </p>
                          </div>
                          <p>
                            This is the description of my attachment, which is a
                            pdf.
                          </p>
                          <div className="d-flex gap-3">
                            <Button variant="outline-secondary" size="sm">
                              Edit
                            </Button>
                            <Button variant="danger" size="sm">
                              Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                      {/* <Form className="attachment-form" onSubmit={addAttachment}>
                    <h3 className="h6">Add a new attachment</h3>
                    <Button variant="secondary">+ Add new attachment</Button>
                  </Form> */}
                    </div>

                    <Button type="submit">Submit form</Button>
                  </fieldset>
                </Form>
              </Col>
            </Row>
          </Container>
        </Container>
      </>
    );
  }

  //if successfully created, show confirmation

  //else, user is not logged in, show prompt
  return (
    <>
      <Head>
        <title>New Syllabus</title>
        <meta name="description" content="Create a new syllabus" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Container>
        <div id="header-section" className="sticky-top">
          <GlobalNav />
        </div>

        <Container>
          <Row className="pt-3 pb-3">
            <Col className="col-8 offset-2">
              <h1 className="h3">New Syllabus</h1>
            </Col>
          </Row>
          <Row className="gap-3 pb-5">
            <Col className="col-8 offset-2">
              <p>
                To create a new syllabus, please{" "}
                <Link href="/login">log in</Link> .
              </p>
            </Col>
          </Row>
        </Container>
      </Container>
    </>
  );
};

export default NewSyllabus;
