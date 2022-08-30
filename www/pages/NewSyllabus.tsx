import { useState, useEffect } from "react";
import type { NextPage } from "next";
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

const NewSyllabus: NextPage = () => {
  const [validated, setValidated] = useState(false);

  useEffect(() => setValidated(false), []);

  const handleSubmit = (event) => {
    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      event.preventDefault();
      event.stopPropagation();
    }
    setValidated(true);
  };

  const addAttachment = (event) => {
    event.preventDefault();
    event.stopPropagation();
    console.log("Attachment added");
  };

  return (
    <div className="container">
      <Head>
        <title>Create New Syllabus</title>
        <meta name="description" content="Create a new syllabus" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
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
              To create a new syllabus, please <Link href="/login">log in</Link>{" "}
              .
            </p>
          </Col>
        </Row>
        <Row className="gap-3 pb-5">
          <Col className="col-8 offset-2">
            <Form noValidate validated={validated} onSubmit={handleSubmit}>
              <fieldset>
                <Form.Group className="mb-3">
                  <Form.Label htmlFor="courseTitle">Course Title</Form.Label>
                  <Form.Control
                    required
                    id="courseTitle"
                    placeholder="History of Web Design"
                  />
                  <Form.Control.Feedback type="invalid">
                    Please provide a valid course title.
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-1">
                  <Form.Label htmlFor="courseLanguage">Institution</Form.Label>
                  <Form.Select id="courseLanguage">
                    <option>select institution</option>
                  </Form.Select>
                </Form.Group>
                <Button variant="secondary" className="mb-3">
                  + Add New Institution
                </Button>

                <Form.Group className="col-3 mb-3">
                  <Form.Label htmlFor="courseCode">Course Code</Form.Label>
                  <Form.Control id="courseCode" placeholder="CS101" />
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

                <Form.Group className="mb-5">
                  <Form.Label htmlFor="courseVirtual" className="mb-0">
                    Virtual Classroom / Distance Learning
                  </Form.Label>
                  <Form.Select id="courseVirtual">
                    <option>—</option>
                    <option>No</option>
                    <option>Yes: Fully Remote</option>
                    <option>Yes: Mixed</option>
                  </Form.Select>
                </Form.Group>

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
                  <Form.Label htmlFor="courseLearningOutcomes">
                    Learning Outcomes
                  </Form.Label>
                  <Form.Control
                    id="courseLearningOutcomes"
                    as="textarea"
                    rows={4}
                    placeholder="Course learning outcomes..."
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label htmlFor="courseTopicsOutline">
                    Topics Outline
                  </Form.Label>
                  <Form.Control
                    id="courseTopicsOutline"
                    as="textarea"
                    rows={4}
                    placeholder="Course topics outline..."
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label htmlFor="courseReadings">Readings</Form.Label>
                  <Form.Control
                    id="courseReadings"
                    as="textarea"
                    rows={4}
                    placeholder="Course readings..."
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label htmlFor="courseGrading">
                    Grading Rubric
                  </Form.Label>
                  <Form.Control
                    id="courseGrading"
                    as="textarea"
                    rows={4}
                    placeholder="Course grading rubric..."
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label htmlFor="courseAssignments">
                    Grading Rubric
                  </Form.Label>
                  <Form.Control
                    id="courseAssignments"
                    as="textarea"
                    rows={4}
                    placeholder="Course assignments..."
                  />
                </Form.Group>

                <hr className="my-3" />
                <div className="mb-5">
                  <h2 className="h4">Attachments</h2>
                  <div className="course-attachments p-3 mb-3 border rounded bg-light">
                    <div class="attachment-item">
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
                  <Form className="attachment-form" onSubmit={addAttachment}>
                    <h3 className="h6">Add a new attachment</h3>
                    <Button variant="secondary">+ Add new attachment</Button>
                  </Form>
                </div>

                <Button type="submit">Submit form</Button>
              </fieldset>
            </Form>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default NewSyllabus;
