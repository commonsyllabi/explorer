import React, { useState, useEffect, FormEvent } from "react";
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
import { Alert, FormSelect, Tabs, Tab } from "react-bootstrap";
import Badge from "react-bootstrap/Badge";
import NewSyllbusAttachment from "components/Syllabus/NewSyllabusAttachment";
import NewSyllabusAttachment from "components/Syllabus/NewSyllabusAttachment";

const countries = require("i18n-iso-countries");
const languages = require("@cospired/i18n-iso-languages");

export const getStaticProps: GetStaticProps = async () => {
  const apiUrl = process.env.API_URL

  console.log(`GetStaticProps API URL: ${apiUrl}`);

  return {
    props: { apiUrl: apiUrl },
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
        {langCode.toUpperCase()} – {languages[langCode]}
      </option>
    ));
    return <>{elements}</>;
  };

  //Form data and submission handling
  //---------------------------------------
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

  interface IAttachment {
    id: string,
    name: string,
    description: string,
    file: File,
    url: string
  }

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

    console.log(formData);

    // Make POST request header
    const postHeader = new Headers();
    if(session != null && session.user != null)
      postHeader.append("Authorization", `Bearer ${session.user.token}`);
    else
      console.warn("no session found!")

    let body = new FormData();
    for (let [key, value] of Object.entries(formData)) {
      body.append(key, value as string);
    }

    const syll_endpoint = new URL("/syllabi/", props.apiUrl)
    fetch(syll_endpoint, {
      method: "POST",
      headers: postHeader,
      body: body,
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
          setError("")
          // institution
          const i = new FormData();
          i.append("name", "School");
          i.append("country", "275");

          const instit_endpoint = new URL(`/syllabi/${body.uuid}/institutions`, props.apiUrl)
          fetch(instit_endpoint, {
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
          // strange that we have a different pattern from institutions here (i guess attahcment is at a higher class than institution)
          console.log(`adding ${attachments.length} attachments`);
          const attach_endpoint = new URL(`/attachments/?syllabus_id=${body.uuid}`, props.apiUrl)
          attachments.map(att => {
            console.warn(`Uploading non-validated ${JSON.stringify(att)}`)

            const a = new FormData()
            a.append("name", att.name)
            a.append("description", att.description ? att.description : "")
            a.append("file", att.file ? att.file : "")
            a.append("url", att.url ? att.url : "") //-- otherwise it defaults to "undefined"

            fetch(attach_endpoint, {
              method: "POST",
              headers: postHeader,
              body: a
            })
              .then(res => {
                console.log(res)
              })
              .catch(err => {
                console.log(err);
              })
          })
        }

      })
      .catch((err) => {
        console.error(`Error: ${err}`);
      });
  };

  const handleNewAttachment = (event: React.SyntheticEvent) => {
    const a = {} as IAttachment
    a.id = `${attachments.length}`
    setAttachments([...attachments, a])
  }

  const updateAttachment = (updated : IAttachment) => {
    console.log(`updating attachment #${updated.id} ${updated.url}`);

    let u = attachments.map(att => {
      if(att.id == updated.id)
        return updated
      else
        return att
    })

    setAttachments(u)
  }

  const removeAttachment = (index : string) => {
    let u = attachments.filter(att => {
      return (att.id != index)
    })

    setAttachments(u)
  }

  //Handle form change
  const handleChange = (event: React.SyntheticEvent) => {
    const t = event.target as HTMLInputElement
    if (t.id === "status") {
      //handle public/private toggle
      const newStatus = formData.status === "unlisted" ? "listed" : "unlisted";
      setFormData({ ...formData, [t.id]: newStatus });
    } else {
      setFormData({ ...formData, [t.id]: t.value });
    }
    // console.log(`${[t.id]}: ${t.value}`);
  };

  //Get public/private form label
  const getPublicPrivateLabel = (status: string) => {
    if (status === "unlisted") {
      return "Private (only viewable to you)";
    } else {
      return "Public (anyone can view)";
    }
  };

  //-- data set up for attachments
  const att = {} as IAttachment
  att.id = "0"
  const [attachments, setAttachments] = useState([att])
  let attachmentElements = []
  for(let i = 0; i < attachments.length; i++){
    attachmentElements.push(<NewSyllabusAttachment key={attachments[i].id} attachment={attachments[i]} updateData={updateAttachment} removeAttachment={removeAttachment}/>)
  }

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
                      <Form.Label htmlFor="language">Language</Form.Label>
                      <Form.Select
                        id="language"
                        onChange={handleChange}
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
                    
                    <div className="mb-5">
                      <h2 className="h4">Attachments</h2>

                      {attachmentElements}

                      <Button type="button" onClick={handleNewAttachment}>Add attachment</Button>
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
