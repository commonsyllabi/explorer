import React, { useState, useEffect, FormEvent } from "react";
import type { GetStaticProps, NextPage } from "next";
import { getSession, useSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";

//Interfaces
import { IFormData, IAttachment, IUploadAttachment, IInstitution, IFormInstitution } from "types";

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


import {
  //UI Utils
  getPublicPrivateLabel,
  //Utils for generating components from data libraries
  generateCountryOptions,
  generateLanguageOptions,
  isValidForm,
  //Utils for fetch requests
  submitForm,
  submitInstitution,
  submitAttachments,
} from "components/utils/formUtils";

import AddAcademicFieldsForm from "components/NewSyllabus/AddAcademicFieldsForm";
import { title } from "process";

export const getStaticProps: GetStaticProps = async () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
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

  const [institutionData, setInstitutionData] = useState<IFormInstitution>(
    {
      name: "Hogwarts",
      country: "012",
      url: "http://hogwarts.com",
      date_year: "2022",
      date_term: "Spring Semester",
    },
  );


  const [log, setLog] = useState("");
  const [error, setError] = useState("");

  //Handle form submission
  const apiUrl = props.apiUrl;
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    const form = event.currentTarget;
    event.preventDefault();
    event.stopPropagation();
    console.log(formData);

    // check if user is logged in
    if (session == null || session.user == null) {
      setError(`It seems you have been logged out. Please log in and try again.`)
      console.warn("No session found!");
      return;
    }

    // bootstrap also supports validation with form.checkValidity()
    const validForm = isValidForm(formData, attachmentData)
    if (validForm.errors.length > 0) {
      console.log(validForm.errors);
      setError(validForm.errors.join('\n'))
      return;
    }

    const postHeader = new Headers();
    postHeader.append("Authorization", `Bearer ${session.user.token}`);

    const res = await submitForm(formData, props.apiUrl, postHeader)
    setFormSubmitted(true);
    if (res.status !== 201) {
      const err = await res.text()
      setError(err);
      setSyllabusCreated("failed");
      return
    }

    const body = await res.json();
    setSyllabusCreated("created");
    setSyllabusUUID(body.uuid);

    const instit_endpoint = new URL(`/syllabi/${body.uuid}/institutions`, props.apiUrl);
    submitInstitution(institutionData, instit_endpoint, postHeader)
      .then(res => {
        if (res.status === 200) {
          setInstitutionCreated("created");
        } else {
          setInstitutionCreated("failed");
        }
      })

    const attach_endpoint = new URL(`/attachments/?syllabus_id=${body.uuid}`, props.apiUrl);
    attachmentData.map((att) => {
      submitAttachments(att, attach_endpoint, postHeader)
        .then(res => {
          if (res.status === 201) {
            setAttachmentsCreated("created");
          } else {
            setAttachmentsCreated("failed");
          }
        })
    })
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
  };

  const handleInstitutionChange = (event: React.SyntheticEvent) => {
    const t = event.target as HTMLInputElement;
    //todo properly handle update
    const key = t.id as keyof IFormInstitution
    institutionData[key] = t.value
    setInstitutionData(institutionData);
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

  const [attachmentData, setAttachmentData] = useState(Array<IUploadAttachment>);

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
              {(syllabusCreated === "created" && attachmentsCreated === "created" && institutionCreated === "created") ? (
                <>
                  <h2>Success!</h2>
                  <p>
                    View{" "}
                    <Link href={`/syllabus/${syllabusUUID}`}>
                      <a>{formData.title} here</a>
                    </Link>
                    .
                  </p>
                </>
              ) : (<>
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
              </>)}


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
                          value={institutionData.name}
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
                          value={institutionData.url}
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
                            id="date_year"
                            placeholder="2022"
                            onChange={handleInstitutionChange}
                            value={institutionData.date_year}
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
                            id="date_term"
                            placeholder="Spring Semester"
                            onChange={handleInstitutionChange}
                            value={institutionData.date_term}
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
