import React, { useState, useEffect } from "react";
import type { NextPage } from "next";
import { getSession, useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";

//Interfaces
import {
  IFormData,
  IAttachment,
  IUploadAttachment,
  IInstitution,
  IFormInstitution,
  IParsedData,
} from "types";

//Components
import NewSyllabusAttachment from "components/NewSyllabus/NewSyllabusAttachment";
import AttachmentItem from "components/NewSyllabus/AttachmentItem";

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
import DragAndDropSyllabus from "components/NewSyllabus/DragAndDropSyllabus";
import { kurintoSerif } from "app/layout";
import SyllabusProcessing from "components/NewSyllabus/SyllabusProcessing";
import ReadingsFieldForm from "components/NewSyllabus/ListFieldForm";
import ListFieldForm from "components/NewSyllabus/ListFieldForm";

const NewSyllabus: NextPage = () => {
  const { data: session, status } = useSession();
  const [validated, setValidated] = useState(false);
  const [errors, setErrors] = useState(Array);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [syllabusCreated, setSyllabusCreated] = useState("pending");
  const [institutionCreated, setInstitutionCreated] = useState("pending");
  const [attachmentsCreated, setAttachmentsCreated] = useState("pending");
  const [syllabusUUID, setSyllabusUUID] = useState("");
  const [parsedData, setParsedData] = useState<IParsedData>();
    const [attachmentData, setAttachmentData] = useState(
    Array<IUploadAttachment>
  );

  const [formData, setFormData] = useState<IFormData>({
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
    status: "listed",
    academic_fields: [],
    academic_level: 0,
    duration: 0,
  });

  const [institutionData, setInstitutionData] = useState<IFormInstitution>({
    name: "",
    country: "",
    url: "",
    date_year: "",
    date_term: "",
  });

  //Handle form submission
  const apiUrl = process.env.NEXT_PUBLIC_API_URL as string;
  const handleSubmit = async (event: React.BaseSyntheticEvent) => {
    event.preventDefault();
    event.stopPropagation();
    // if (form.checkValidity() === false) {
    //   setValidated(true);
    // }

    if (session == null || session.user == null) {
      setErrors([
        `It seems you have been logged out. Please log in and try again.`,
      ]);
      console.warn("No session found!");
      return;
    }

    const validForm = isValidForm(formData, attachmentData, institutionData);
    if (validForm.errors.length > 0) {
      setErrors(validForm.errors);
      return;
    }

    const header = new Headers();
    header.append("Authorization", `Bearer ${session.user.token}`);

    const syll_endpoint = new URL(`/syllabi/`, apiUrl)
    const res = await submitForm(formData, syll_endpoint, "POST", header);
    setFormSubmitted(true);
    if (res.status !== 201) {
      const err = await res.text();
      setErrors([err]);
      setSyllabusCreated("failed");
      return;
    }

    const body = await res.json();
    setSyllabusCreated("created");
    setSyllabusUUID(body.uuid);

    const instit_endpoint = new URL(
      `/syllabi/${body.uuid}/institutions`,
      apiUrl
    );
    submitInstitution(institutionData, instit_endpoint, "POST", header).then(
      (res) => {
        if (res.status === 200) {
          setInstitutionCreated("created");
        } else {
          setInstitutionCreated("failed");
        }
      }
    );

    if (attachmentData.length === 0) {
      setAttachmentsCreated("created");
      return;
    }
    const attach_endpoint = new URL(
      `/attachments/?syllabus_id=${body.uuid}`,
      apiUrl
    );
    attachmentData.map((att) => {
      submitAttachments(att, attach_endpoint, "POST", header).then((res) => {
        if (res.status === 201) {
          setAttachmentsCreated("created");
        } else {
          setAttachmentsCreated("failed");
        }
      });
    });
  };

  const handleChange = (event: React.SyntheticEvent) => {
    const t = event.target as HTMLInputElement;
    if (t.id === "status") {
      const newStatus = formData.status === "unlisted" ? "listed" : "unlisted";
      setFormData({ ...formData, [t.id]: newStatus });
    } else if (t.id === "tags") {
      const tags = t.value.split(",").map((tag) => tag.trim());
      setFormData({ ...formData, ["tags"]: [...tags] });
    } else {
      setFormData({ ...formData, [t.id]: t.value });
    }
  };

  const handleInstitutionChange = (event: React.SyntheticEvent) => {
    const t = event.target as HTMLInputElement;
    const key = t.id as keyof IFormInstitution;
    institutionData[key] = t.value;
    setInstitutionData(institutionData);
  };

  //display elements for attachment
  const getUploadedAttachments = (attachmentData: IUploadAttachment[]) => {
    const uploadedAttachments = attachmentData.map((attachment) => (
      <AttachmentItem
        key={`attachment-${attachment.id}`}
        attachment={attachment}
        attachmentData={attachmentData}
        setAttachmentData={setAttachmentData}
      />
    ));
    return uploadedAttachments;
  };

  //-- if not signed in
  if (status !== "authenticated")
    return (
      <div className="w-11/12 md:w-10/12 m-auto mt-8">
        <div className="pt-3 pb-3">
          <h1 className={`${kurintoSerif.className} text-3xl`}>New Syllabus</h1>
        </div>
        <div className="gap-3 pb-5">
          To create a new syllabus, please{" "}
          <Link href="/auth/signin" className="underline">log in</Link> .
        </div>
      </div>
    );

  //-- if submitted
  if (formSubmitted) {
    return (
      <SyllabusProcessing syllabusCreated={syllabusCreated} attachmentsCreated={attachmentsCreated} institutionCreated={institutionCreated} syllabusUUID={syllabusUUID} handleClick={() => setFormSubmitted(false)} />
    );
  }

  return (
    <>
      <div className="w-11/12 md:w-10/12 m-auto mt-8">
        <div className="pt-3 pb-3">
          <div className="col-8 offset-2">
            <h1 className={`${kurintoSerif.className} text-3xl`}>New Syllabus</h1>
          </div>
        </div>

        <div className="gap-3 pb-5 my-6">
          <div className="col-8 offset-2">
            <form noValidate>

              <div className="flex flex-col my-8 gap-2">
                <label htmlFor="title">Course Title*</label>
                <input
                  className="bg-transparent mt-2 py-1 border-b-2 border-b-gray-900"
                  type="text"
                  required
                  id="title"
                  name="title"
                  placeholder="e.g. Intro to Sociology"
                  onChange={handleChange}
                  value={formData.title}
                  data-cy="courseTitleInput"
                // defaultValue={parsedData?.data?.title || ""} -- // TODO: we cannot have both defaultValue and value props. parsedData should set formData.title, instead?
                />
                <div className="text-sm">
                  Please provide a valid course title.
                </div>
              </div>

              <div className="flex items-center gap-3">
                <label htmlFor="status" className="order-2">
                  {getPublicPrivateLabel(formData.status)}
                </label>
                <div className="relative border-2 w-6 h-6 border-gray-900 p-0.5 order-1 rounded-full">
                  <input
                    type="checkbox"
                    role="switch"
                    className="absolute w-4 h-4 appearance-none bg-gray-300 checked:bg-gray-900 cursor-pointer rounded-full"
                    onChange={handleChange}
                    name="status"
                    id="status"
                    value={formData.status}
                    data-cy="courseStatusInput" />
                </div>
              </div>

              <hr className="my-12 border border-gray-300" />

              <div className="w-10/12 m-auto my-32 border border-gray-900 rounded-lg p-2">
                <h4>
                  Upload a syllabus and autofill{"  "}
                  <span className="w-min p-1 border-2 border-gray-400 rounded-xl">
                    New
                  </span>
                </h4>
                <DragAndDropSyllabus session={session} onSyllabusUpload={setParsedData} />
              </div>

              <hr className="my-12 border border-gray-300" />

              {/* //TODO make add institution work */}
              <div className="institution-section my-12 flex flex-col gap-3">
                <div className="mb-1 flex flex-col">
                  <label htmlFor="name" className="mb-0">
                    Institution*
                  </label>
                  <div className="col-10">
                    <input
                      className="w-full bg-transparent mt-2 py-1 border-b-2 border-b-gray-900"
                      type="text"
                      required
                      id="name"
                      placeholder="e.g. Open University"
                      onChange={handleInstitutionChange}
                      data-cy="institutionNameInput"
                    />
                  </div>
                  <div className="text-sm">
                    Please provide the name of the institution where this
                    course was taught.
                  </div>
                </div>

                <div className="mb-1">
                  <label htmlFor="country">Country*</label>
                  <select
                    className="w-full bg-transparent mt-2 p-1 border-2 border-gray-900"
                    id="country"
                    onChange={handleInstitutionChange}
                    data-cy="institutionCountryInput"
                  >
                    <option> – </option>
                    {generateCountryOptions()}
                  </select>
                  <div className="text-sm">
                    Please provide the country where this course was taught.
                  </div>
                </div>

                <div className="mb-1 flex flex-col">
                  <label htmlFor="url" className="mb-0">
                    Institution Website
                  </label>
                  <div className="col-8">
                    <input
                      className="w-full bg-transparent mt-2 py-1 border-b-2 border-b-gray-900"
                      type="url"
                      id="url"
                      placeholder="e.g. https://open.university"
                      onChange={handleInstitutionChange}
                      data-cy="institutionUrlInput"
                    />
                  </div>
                </div>
                <div className="row">
                  <div className="col-2">
                    <div className="mb-1 flex flex-col">
                      <label htmlFor="year" className="mb-0">
                        Year*
                      </label>
                      <input
                        className="bg-transparent mt-2 py-1 border-b-2 border-b-gray-900"
                        required
                        id="date_year"
                        placeholder="e.g. 2021"
                        type="number"
                        min="1800"
                        max={new Date().getFullYear()}
                        onChange={handleInstitutionChange}
                        data-cy="institutionYearInput"
                      />
                      <div className="text-sm">
                        Please provide the year this course was taught.
                      </div>
                    </div>
                  </div>
                  <div className="col-4 flex flex-col">
                    <div className="my-1 flex flex-col">
                      <label htmlFor="term" className="mb-0">
                        Term*
                      </label>
                      <input
                        className="bg-transparent mt-2 py-1 border-b-2 border-b-gray-900"
                        type="text"
                        required
                        id="date_term"
                        placeholder="e.g. Spring"
                        onChange={handleInstitutionChange}
                        data-cy="institutionTermInput"
                      />
                      <div className="text-sm">
                        Please provide the academic term during which this
                        course was taught.
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <hr className="my-12 border border-gray-300" />

              {/* COURSE INPUT TEMPORARY OMITTED BEFORE EDGE IMPLEMENTATION */}
              {/* <div className="flex flex-col my-8 gap-2">
                    <label htmlFor="courseCode">Course Number</label>
                    <div className="col-4">
                      <input
                        id="course_number"
                        placeholder=""
                        onChange={handleChange}
                        value={formData.course_number}
                        data-cy="courseCodeInput"
                      />
                    </div>
                  </div> */}

              <AddAcademicFieldsForm
                setAcadFieldsData={(_af: string[]) => {setFormData({ ...formData, ["academic_fields"]: _af });                }}
                academicFields={[]}
              />

              <div className="mb-5">
                <label htmlFor="academic_level" className="mb-0">
                  Academic Level
                </label>
                <div className="col-6">
                  <select
                    className="w-full bg-transparent mt-2 p-1 border-2 border-gray-900"
                    id="academic_level"
                    onChange={handleChange}
                    value={formData.academic_level}
                    data-cy="academicLevelInput"
                  >
                    <option value="0">Other</option>
                    <option value="1">Bachelor</option>
                    <option value="2">Master</option>
                    <option value="3">Doctoral</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col my-8 gap-2">
                <label htmlFor="language">Language*</label>
                <select
                  className="bg-transparent mt-2 p-1 border-2 border-gray-900"
                  id="language"
                  onChange={handleChange}
                  data-cy="courseLanguageInput"
                >
                  <option value="">—</option>
                  {generateLanguageOptions()}
                </select>
                <div className="text-sm">
                  The language in which this course was
                  taught.
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex flex-col my-8 gap-2 w-full">
                  <label htmlFor="duration">
                    Duration of course in weeks
                  </label>
                  <input
                    className="bg-transparent mt-2 py-1 border-b-2 border-b-gray-900 w-full"
                    type="text"
                    id="duration"
                    onChange={handleChange}
                    placeholder="e.g. 14 weeks"
                    data-cy="courseDurationInput"
                  />
                </div>
              </div>

              <hr className="my-12 border border-gray-300" />

              <div className="flex flex-col my-8 gap-2">
                <label htmlFor="tags">Tags*</label>
                <textarea
                  className="bg-transparent mt-2 p-1 border border-gray-900"
                  required
                  id="tags"
                  onChange={handleChange}
                  placeholder="introductory, sociology, methodology"
                  data-cy="courseTagsInput"
                />
                <div className="text-sm">
                  Please provide a comma-separated list of tags
                </div>
              </div>

              <hr className="my-12 border border-gray-300" />

              <div className="flex flex-col my-8 gap-2">
                <label htmlFor="description">Description*</label>
                <textarea
                  className="bg-transparent mt-2 p-1 border border-gray-900"
                  required
                  id="description"
                  onChange={handleChange}
                  rows={4}
                  placeholder="Course outline..."
                  data-cy="courseDescriptionInput"
                />
                <div className="text-sm">
                  Please provide a brief description of the course.
                </div>
              </div>

              <div className="flex flex-col my-8 gap-2">
                <label htmlFor="learning_outcomes">
                  Learning Outcomes
                </label>
                <textarea
                  className="bg-transparent mt-2 p-1 border border-gray-900"
                  id="learning_outcomes"
                  onChange={handleChange}
                  rows={4}
                  placeholder="Course learning outcomes..."
                  data-cy="courseLearningOutcomes"
                />
              </div>

              <div className="flex flex-col my-8 gap-2">
                <label htmlFor="topic_outlines">
                  Topics Outline
                </label>
                <textarea
                  className="bg-transparent mt-2 p-1 border border-gray-900"
                  id="topic_outlines"
                  onChange={handleChange}
                  rows={4}
                  placeholder="Course topics outline..."
                  data-cy="courseTopicsOutline"
                />
              </div>

              <ListFieldForm name="Readings" data={formData.readings} setData={(_r: string[]) => { setFormData({ ...formData, ["readings"]: [..._r] }) }} />

              <div className="flex flex-col my-8 gap-2">
                <label htmlFor="grading_rubric">
                  Grading Rubric
                </label>
                <textarea
                  className="bg-transparent mt-2 p-1 border border-gray-900"
                  id="grading_rubric"
                  onChange={handleChange}
                  rows={4}
                  placeholder="Course grading rubric..."
                  data-cy="courseGradingRubric"
                />
              </div>

              <div className="flex flex-col my-8 gap-2">
                <label htmlFor="assignments">Assignments</label>
                <textarea
                  className="bg-transparent mt-2 p-1 border border-gray-900"
                  id="assignments"
                  rows={4}
                  placeholder="Course assignments..."
                  data-cy="courseAssignments"
                />
              </div>

              <hr className="my-12 border border-gray-300" />

              <div className="mb-5">
                <h2 className="text-xl">
                  Attachments ({attachmentData.length})
                </h2>
                {getUploadedAttachments(attachmentData)}
                <NewSyllabusAttachment
                  attachmentData={attachmentData}
                  setAttachmentData={setAttachmentData}
                />
              </div>

              <button onClick={handleSubmit} data-cy="courseSubmitButton" className="p-2 bg-gray-900 text-gray-100 border-2 rounded-md">
                Submit New Syllabus
              </button>

              {errors.length > 0 ? (
                errors.map((err, index) => {
                  return (
                    <div
                      className="w-full mt-3 p-2 bg-red-200"
                      key={`error-${index}`}
                    >
                      {err as string}
                    </div>
                  );
                })
              ) : (
                <></>
              )}
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default NewSyllabus;
