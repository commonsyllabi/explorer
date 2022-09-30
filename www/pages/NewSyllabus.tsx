import React, { useState, useEffect, FormEvent } from "react";
import type { GetStaticProps, NextPage } from "next";
import { getSession, useSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";

//Interfaces
import { IFormData, IAttachment, IUploadAttachment, IInstitution } from "types";

//Bootstrap
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import { Alert, FormSelect, Tabs, Tab } from "react-bootstrap";
import Badge from "react-bootstrap/Badge";

//Components
import Favicons from "components/head/favicons";
import GlobalNav from "components/GlobalNav";
import NewSyllabusAttachment from "components/NewSyllabus/NewSyllabusAttachment";
import InstitutionCreationStatus from "components/NewSyllabus/InstitutionCreationStatus";
import AttachmentsCreationStatus from "components/NewSyllabus/AttachmentsCreationStatus";
import SyllabusCreationStatus from "components/NewSyllabus/SyllabusCreationStatus";
import AttachmentItemFile from "components/NewSyllabus/AttachmentItemFile";

//UI Utils
import { getPublicPrivateLabel } from "components/utils/formUtils";

//Utils for generating components from data libraries
import {
  generateCountryOptions,
  generateLanguageOptions,
} from "components/utils/formUtils";
import AddAcademicFieldsForm from "components/NewSyllabus/AddAcademicFieldsForm";

export const getStaticProps: GetStaticProps = async () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

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
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [syllabusCreated, setSyllabusCreated] = useState("pending");
  const [institutionCreated, setInstitutionCreated] = useState("pending");
  const [attachmentsCreated, setAttachmentsCreated] = useState("pending");
  const [syllabusUUID, setSyllabusUUID] = useState("");

  useEffect(() => {
    setValidated(true);
  }, []);

  //Form data and submission handling
  //---------------------------------------
  //Store form data
  // const [formData, setFormData] = useState<IFormData>({
  //   institutions: [],
  //   title: "",
  //   course_number: "",
  //   description: "",
  //   attachments: [],
  //   tags: [],
  //   language: "",
  //   learning_outcomes: [],
  //   topic_outlines: [],
  //   readings: [],
  //   grading_rubric: "",
  //   assignments: [],
  //   other: "",
  //   status: "unlisted",
  //   academic_fields: [],
  //   academic_level: 0,
  //   duration: 0,
  // });

  const [formData, setFormData] = useState<IFormData>({
    institutions: [],
    title: "Test Dummy Course",
    course_number: "DUM101",
    description: "Some elegant description of this wonderful course.",
    attachments: [],
    tags: [],
    language: "EN",
    learning_outcomes: [],
    topic_outlines: [],
    readings: [],
    grading_rubric: "",
    assignments: [],
    other: "",
    status: "listed",
    academic_fields: [],
    academic_level: 0,
    duration: 0,
  });

  // const [institutionData, setInstitutionData] = useState([
  //   {
  //     name: "",
  //     country: "",
  //     url: "",
  //     year: "",
  //     term: "",
  //   },
  // ]);

  const [institutionData, setInstitutionData] = useState([
    {
      name: "Hogwarts",
      country: "012",
      url: "http://hogwarts.com",
      year: "2022",
      term: "Spring Semester",
    },
  ]);

  const [log, setLog] = useState("");
  const [error, setError] = useState("");
  const [isCreated, setCreated] = useState(false);

  //Handle form submission
  const apiUrl = props.apiUrl;
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    // TODO: Validate form
    const form = event.currentTarget;
    // if (form.checkValidity() === false) {
    setFormSubmitted(true);
    event.preventDefault();
    event.stopPropagation();
    // }
    // setValidated(true);
    // if (validated) {
    //   //send post request
    // }

    console.log(formData);

    // Make syllabus POST request header
    const postHeader = new Headers();
    if (session != null && session.user != null)
      postHeader.append("Authorization", `Bearer ${session.user.token}`);
    else console.warn("No session found!");

    // Make syllabus POST request body
    let body = new FormData();

    for (let [key, value] of Object.entries(formData)) {
      body.append(key, value as string);
    }

    const syll_endpoint = new URL("/syllabi/", props.apiUrl);
    fetch(syll_endpoint, {
      method: "POST",
      headers: postHeader,
      body: body,
    })
      .then((res) => {
        if (res.status == 201) {
          const responseBody = res.json();
          console.log("SUCCESS, syllabus created.");
          console.log(`Syllabus POST response: ${responseBody}`);
          setCreated(true);
          setSyllabusCreated("created");
          return responseBody; // should we instead return just the uuid?
        } else {
          setSyllabusCreated("failed");
          return res.text();
        }
      })
      .then((body) => {
        if (typeof body == "string") {
          // if it's an error, it returns text
          setError(body);
        } else if (typeof body == "object") {
          // Now that syllabus is created...
          // Set the newly created syllabus UUID
          setSyllabusUUID(body.uuid);

          // and make institution & attachments POST requests
          //--------------------------------------
          // POST institution
          const i = new FormData();
          i.append("name", institutionData[0].name);
          i.append("url", institutionData[0].url);
          i.append("country", institutionData[0].country);
          i.append("date_year", institutionData[0].year);
          i.append("date_term", institutionData[0].term);

          const instit_endpoint = new URL(
            `/syllabi/${body.uuid}/institutions`,
            props.apiUrl
          );

          fetch(instit_endpoint, {
            method: "POST",
            headers: postHeader,
            body: i,
          })
            .then((res) => {
              console.log(res);
              if (res.status === 200) {
                const responseBody = res.json();
                console.log(`SUCCESS, Institutions created.`);
                console.log(`Institution POST response: ${responseBody}`);
                setInstitutionCreated("created");
                return responseBody;
              } else {
                const responseErrorMsg = res.text();
                console.log(`ERROR, institutions failed.`);
                console.log(`Institution POST response: ${responseErrorMsg}`);
                setInstitutionCreated("failed");
                return responseErrorMsg;
              }
            })
            .catch((err) => {
              console.log(err);
            });

          // POST attachments
          // strange that we have a different pattern from institutions
          // here(i guess attahcment is at a higher class than institution)
          console.log(`adding ${attachmentData.length} attachments`);
          const attach_endpoint = new URL(
            `/attachments/?syllabus_id=${body.uuid}`,
            props.apiUrl
          );
          attachmentData.map((att) => {
            console.warn(`Uploading non-validated ${JSON.stringify(att)}`);

            const a = new FormData();
            a.append("name", att.name);
            a.append("description", att.description ? att.description : "");
            a.append("file", att.file ? att.file : "");
            a.append("url", att.url ? att.url : ""); //-- otherwise it defaults to "undefined"

            fetch(attach_endpoint, {
              method: "POST",
              headers: postHeader,
              body: a,
            })
              .then((res) => {
                console.log(res);
                if (res.status === 201) {
                  const responseBody = res.json();
                  console.log(`SUCCESS, attachments created.`);
                  console.log(`Attachments POST response: ${responseBody}`);
                  setAttachmentsCreated("created");
                  return responseBody;
                } else {
                  const responseErrorMsg = res.text();
                  console.log(`ERROR, attachments failed.`);
                  console.log(`Attachments POST response: ${responseErrorMsg}`);
                  setAttachmentsCreated("failed");
                  return responseErrorMsg;
                }
              })
              .catch((err) => {
                console.log(err);
              });
          });
        }
      })
      .catch((err) => {
        console.error(`Error: ${err}`);
      });
  };

  //Handle form changes
  const handleChange = (event: React.SyntheticEvent) => {
    const t = event.target as HTMLInputElement;
    if (t.id === "status") {
      //handle public/private toggle
      const newStatus = formData.status === "unlisted" ? "listed" : "unlisted";
      setFormData({ ...formData, [t.id]: newStatus });
    } else {
      setFormData({ ...formData, [t.id]: t.value });
    }
    console.log(`${[t.id]}: ${t.value}`);
  };

  const handleInstitutionChange = (event: React.SyntheticEvent) => {
    const t = event.target as HTMLInputElement;
    setInstitutionData([{ ...institutionData[0], [t.id]: t.value }]);
    console.log(`${[t.id]}: ${t.value}`);
  };

  const setAcadFieldsData = (acadFieldsArray: string[]) => {
    setFormData({ ...formData, ["academic_fields"]: acadFieldsArray });
  };

  // TODO: Update this for the next academic field input system
  const handleAcademicFieldChange = (event: React.SyntheticEvent) => {
    const allInputGroups: HTMLCollection =
      document.getElementsByClassName("academicFieldInput");
    let checkedFields = [];
    for (let i = 0; i < allInputGroups.length; i++) {
      const fieldCode =
        allInputGroups[i].getElementsByTagName("input")[0].value;
      const isChecked =
        allInputGroups[i].getElementsByTagName("input")[0].checked;
      // console.log(`${fieldCode}: ${isChecked}`);
      if (isChecked === true) {
        checkedFields.push(fieldCode);
      }
    }
    console.log(`checkedFields: ${checkedFields}`);
    setFormData({ ...formData, ["academic_fields"]: checkedFields });
  };

  //-- data set up for attachments
  const dummyLinkAttachment: IUploadAttachment = {
    id: 0,
    name: "Banana Link",
    description: "Real nice links.",
    url: "www.banana.com",
    type: "url",
  };

  const dummyFileAttachment: IUploadAttachment = {
    id: 1,
    name: "Tropical File",
    description: "What a lovely file",
    type: "pdf",
    size: "32.0mb",
  };

  const [attachmentData, setAttachmentData] = useState([
    dummyLinkAttachment,
    dummyFileAttachment,
  ]);

  //display elements for attachment
  const getUploadedAttachments = (attachmentData: IUploadAttachment[]) => {
    const uploadedAttachments = attachmentData.map((attachment) => (
      <AttachmentItemFile
        key={`attachment-${attachment.id}`}
        attachment={attachment}
        attachmentData={attachmentData}
        setAttachmentData={setAttachmentData}
      />
    ));
    return uploadedAttachments;
  };

  //if submitted, show progress and status confirmation
  if (status === "authenticated" && formSubmitted === true) {
    return (
      <>
        <Head>
          <title>New Syllabus</title>
          <meta name="description" content="Create a new syllabus" />
          <Favicons />
        </Head>

        <Container fluid id="header-section" className="sticky-top">
          <GlobalNav />
        </Container>
        <Container>
          <Row className="pt-3 pb-3">
            <Col className="col-8 offset-2">
              <h1 className="h3">Creating new syllabus...</h1>

              <ul>
                <SyllabusCreationStatus status={syllabusCreated} />
                <li>
                  syllabusCreated:
                  <pre>{syllabusCreated}</pre>
                </li>

                <InstitutionCreationStatus status={institutionCreated} />
                <li>
                  institutionCreated:
                  <pre>{institutionCreated}</pre>
                </li>

                <AttachmentsCreationStatus status={attachmentsCreated} />
                <li>
                  attachmentsCreated:
                  <pre>{attachmentsCreated}</pre>
                </li>
              </ul>

              <h2>Success!</h2>
              <p>
                View{" "}
                <Link href={`/syllabus/${syllabusUUID}`}>
                  <a>{formData.title} here</a>
                </Link>
                .
              </p>
            </Col>
          </Row>
        </Container>
      </>
    );
  }
  if (status === "authenticated" && formSubmitted === false) {
    //if user is logged in, show form
    return (
      <>
        <Head>
          <title>New Syllabus</title>
          <meta name="description" content="Create a new syllabus" />
          <Favicons />
        </Head>

        <Container fluid id="header-section" className="sticky-top">
          <GlobalNav />
        </Container>

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
                  <div className="institution-section my-5">
                    <Form.Group className="mb-1">
                      <Form.Label htmlFor="name" className="mb-0">
                        Institution*
                      </Form.Label>
                      <div className="col-10">
                        <Form.Control
                          required
                          id="name"
                          placeholder="Black Mountain College"
                          onChange={handleInstitutionChange}
                          value={institutionData[0].name}
                          data-cy="instutionNameInput"
                        />
                      </div>
                      <Form.Control.Feedback type="invalid">
                        Please provide the name of the institution where this
                        course was taught.
                      </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="mb-1">
                      <Form.Label htmlFor="country">Country*</Form.Label>
                      <Form.Select
                        id="country"
                        onChange={handleInstitutionChange}
                        data-cy="institutionCountryInput"
                      >
                        <option> – </option>
                        {generateCountryOptions()}
                      </Form.Select>
                      <Form.Text>
                        Please provide the country where this course was taught.
                      </Form.Text>
                    </Form.Group>

                    <Form.Group className="mb-1">
                      <Form.Label htmlFor="url" className="mb-0">
                        Institution Website
                      </Form.Label>
                      <div className="col-8">
                        <Form.Control
                          id="url"
                          placeholder="http://hogwarts.com"
                          onChange={handleInstitutionChange}
                          value={institutionData[0].url}
                          data-cy="instutionUrlInput"
                        />
                      </div>
                    </Form.Group>
                    <div className="row">
                      <div className="col-2">
                        <Form.Group className="mb-1">
                          <Form.Label htmlFor="year" className="mb-0">
                            Year*
                          </Form.Label>
                          <Form.Control
                            required
                            id="year"
                            placeholder="2022"
                            onChange={handleInstitutionChange}
                            value={institutionData[0].year}
                            data-cy="instutionYearInput"
                          />
                          <Form.Control.Feedback type="invalid">
                            Please provide the year this course was taught.
                          </Form.Control.Feedback>
                        </Form.Group>
                      </div>
                      <div className="col-4">
                        <Form.Group className="mb-1">
                          <Form.Label htmlFor="term" className="mb-0">
                            Term*
                          </Form.Label>
                          <Form.Control
                            required
                            id="term"
                            placeholder="Spring Semester"
                            onChange={handleInstitutionChange}
                            value={institutionData[0].term}
                            data-cy="instutionTermInput"
                          />
                          <Form.Control.Feedback type="invalid">
                            Please provide the academic term during which this
                            course was taught.
                          </Form.Control.Feedback>
                        </Form.Group>
                      </div>
                    </div>
                  </div>

                  <Form.Group className="mb-3">
                    <Form.Label htmlFor="courseCode">Course Number</Form.Label>
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

                  <AddAcademicFieldsForm
                    setAcadFieldsData={setAcadFieldsData}
                  />

                  <Form.Group className="mb-5">
                    <Form.Label htmlFor="academic_level" className="mb-0">
                      Academic Level
                    </Form.Label>
                    <div className="col-6">
                      <Form.Select
                        id="academic_level"
                        onChange={handleChange}
                        value={formData.academic_level}
                        data-cy="academicLevelInput"
                      >
                        <option value="0">Other</option>
                        <option value="1">Bachelor</option>
                        <option value="2">Master</option>
                        <option value="3">Doctoral</option>
                      </Form.Select>
                    </div>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label htmlFor="language">Language*</Form.Label>
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
                        id="duration"
                        onChange={handleChange}
                        placeholder="3"
                        data-cy="courseDurationInput"
                      />
                    </Form.Group>
                  </div>

                  <hr className="my-3" />

                  <Form.Group className="mb-3">
                    <Form.Label htmlFor="description">Description*</Form.Label>
                    <Form.Control
                      required
                      id="description"
                      onChange={handleChange}
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
                      onChange={handleChange}
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
                      onChange={handleChange}
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
                      onChange={handleChange}
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
                      onChange={handleChange}
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
                    <h2 className="h4">
                      Attachments ({attachmentData.length})
                    </h2>
                    {getUploadedAttachments(attachmentData)}
                    {/* {attachments} */}
                    <NewSyllabusAttachment
                      attachmentData={attachmentData}
                      setAttachmentData={setAttachmentData}
                    />
                  </div>

                  <Button type="submit" data-cy="courseSubmitButton">
                    Submit New Syllabus
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
      </>
    );
  }

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
