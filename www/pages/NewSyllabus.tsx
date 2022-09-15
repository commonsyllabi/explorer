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
import { Alert, FormSelect } from "react-bootstrap";
import Badge from "react-bootstrap/Badge";

const countries = require("i18n-iso-countries");
const languages = require("@cospired/i18n-iso-languages");

export const getStaticProps: GetStaticProps = async () => {
  const apiUrl = new URL(`syllabi/`, process.env.API_URL);

  console.log(`GetStaticProps API URL: ${apiUrl.href}`);

  return {
    props: { apiUrl: apiUrl.href },
  };
};

interface INewSyllabusProps {
  apiUrl: string;
}

const NewSyllabus: NextPage<INewSyllabusProps> = (props) => {
  const { data: session, status } = useSession();
  const [validated, setValidated] = useState(true);

  useEffect(() => {
    setValidated(true);
  }, []);

  //Set up list of countries (for use in "Add Institution" section)
  const setUpCountries = () => {
    countries.registerLocale(require("i18n-iso-countries/langs/en.json"));
    console.log(countries.getNames("en", { select: "official" }));
  };

  //Set up list of languages and generate language dropdown elements
  const setUpLanguages = () => {
    languages.registerLocale(
      require("@cospired/i18n-iso-languages/langs/en.json")
    );
    // console.log(languages.getNames("en"));
    return languages.getNames("en");
  };
  const generateLanguageOptions = () => {
    const languages = setUpLanguages();
    const elements = Object.keys(languages).map((langCode) => (
      <option key={langCode} value={langCode.toUpperCase()}>
        {languages[langCode]} ({langCode.toUpperCase()})
      </option>
    ));
    return <>{elements}</>;
  };

  //Form data and submission handling
  //---------------------------------------
  //Mock data
  const [testFormData, setTestFormData] = useState({
    title: "Pomeranian Studies",
    course_number: "POM101",
    description: "This course is an introduction to pomeranian care. ",
    "tags[]": "canine care",
    "tags[]": "pomeranians",
    language: "en",
    duration: 500,
    status: "unlisted",
    "academic_fields[]": 100,
    academic_level: 3,
  });
  //Store form data
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
    duration: 0,
  });
  const [log, setLog] = useState("");
  const [error, setError] = useState("");
  const [isCreated, setCreated] = useState(false);

  //Handle form submission
  const apiUrl = props.apiUrl;
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    console.log("handleSubmit() called");

    // TODO: Validate form
    const form = event.currentTarget;
    // if (form.checkValidity() === false) {
    event.preventDefault();
    event.stopPropagation();
    // }
    // setValidated(true);
    // if (validated) {
    //   //send post request
    // }

    console.log(testFormData);

    // Make POST request header
    const postHeader = new Headers();
    postHeader.append("Authorization", `Bearer ${session.user.token}`);

    // Make POST request body
    let formData = new FormData();

    for (let [key, value] of Object.entries(testFormData)) {
      formData.append(key, value);
    }

    fetch(apiUrl, {
      method: "POST",
      headers: postHeader,
      body: formData,
    })
      .then((res) => {
        if (res.status == 201) {
          console.log("SUCCESS, syllabus created.");
          setCreated(true);

          return res.json(); // should we instead return just the uuid?
        } else {
          return res.text();
        }
      })
      .then((body) => {
        console.log(body);
        if (typeof body == "string") {
          // if it's an error, it returns text
          setError(body);
        } else if (typeof body == "object") {
          // institution
          const i = new FormData();
          i.append("name", "School");
          i.append("country", "275");

          const instit_endpoint = `/syllabi/${body.uuid}/institutions`;
          fetch("http://localhost:3046" + instit_endpoint, {
            method: "POST",
            headers: postHeader,
            body: i,
          })
            .then((res) => {
              console.log(res);
              return;
            })
            .catch((err) => {
              console.log(err);
            });

          // attachments

          //--
          // this whole dom querying is probably not the way to do it (see handleChange?)
          // for now, it seems the form data is always empty...? because i'm not using https://reactjs.org/docs/forms.html#controlled-components to get the value of things (probs similar for institutions above tbh)
          const atts = document.getElementsByClassName("attachment-inputs");
          console.log(`found ${atts.length} attachments`);

          for (let i = 0; i < atts.length; i++) {
            const f = atts.item(i) as HTMLFormElement;
            console.log(f);

            const a = new FormData(f);

            // strange that we have a different pattern here (i guess attahcment is at a higher class than institution)
            const attach_endpoint = `/attachments/?syllabus_id=${body.uuid}`;
            fetch("http://localhost:3046" + attach_endpoint, {
              method: "POST",
              headers: postHeader,
              body: a,
            })
              .then((res) => {
                console.log(res);
              })
              .catch((err) => {
                console.log(err);
              });
          }
        }
      })
      .catch((err) => {
        console.error(`Error: ${err}`);
      });
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
                      <Form.Label htmlFor="title">Course Title</Form.Label>
                      <Form.Control
                        required
                        id="title"
                        placeholder="Web Design History"
                        onChange={handleChange}
                        value={formData.title}
                        data-cy="courseTitleInput"
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
                        data-cy="courseStatusInput"
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
                          data-cy="courseCodeInput"
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

                    <Form.Group className="mb-3">
                      <Form.Label htmlFor="courseLanguage">Language</Form.Label>
                      <Form.Select
                        id="courseLanguage"
                        data-cy="courseLanguageInput"
                      >
                        <option value="">—</option>
                        {generateLanguageOptions()}
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
                        <Form.Control
                          id="durcation"
                          placeholder="3"
                          data-cy="courseDurationInput"
                        />
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
                        data-cy="courseDescriptionInput"
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
                        data-cy="courseLearningOutcomes"
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
                        data-cy="courseTopicsOutline"
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label htmlFor="readings">Readings</Form.Label>
                      <Form.Control
                        id="readings"
                        as="textarea"
                        rows={4}
                        placeholder="Course readings..."
                        data-cy="courseReadings"
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
                        data-cy="courseGradingRubric"
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label htmlFor="assignments">Assignments</Form.Label>
                      <Form.Control
                        id="assignments"
                        as="textarea"
                        rows={4}
                        placeholder="Course assignments..."
                        data-cy="courseAssignments"
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
                            {/* <form
                              className="attachment-inputs"
                              id="attachment-input"
                            >
                              <Form.Group>
                                <Form.Label>Name</Form.Label>
                                <Form.Control
                                  type="text"
                                  id="name"
                                  className=".attachment-names"
                                />
                              </Form.Group>

                              <Form.Group>
                                <Form.Label>
                                  File (to do: support URL input)
                                </Form.Label>
                                <Form.Control
                                  type="file"
                                  id="file"
                                  className=".attachment-files"
                                />
                              </Form.Group>
                            </form> */}

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

                    <Button type="submit" data-cy="courseSubmitButton">
                      Submit form
                    </Button>

                    {error !== "" ? (
                      <Alert variant="danger" className="mt-3">
                        {error}
                      </Alert>
                    ) : (
                      <></>
                    )}
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
