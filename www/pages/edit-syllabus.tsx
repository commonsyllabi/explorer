import React, { useState, useEffect, FormEvent } from "react";
import type { GetServerSidePropsContext, GetStaticProps, NextPage } from "next";
import { getSession, useSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";

//Interfaces
import {
  IFormData,
  IAttachment,
  IUploadAttachment,
  IInstitution,
  IFormInstitution,
  IParsedData,
  ISyllabus,
} from "types";

//Components
import NewSyllabusAttachment from "components/NewSyllabus/NewSyllabusAttachment";
import InstitutionCreationStatus from "components/NewSyllabus/InstitutionCreationStatus";
import AttachmentsCreationStatus from "components/NewSyllabus/AttachmentsCreationStatus";
import SyllabusCreationStatus from "components/NewSyllabus/SyllabusCreationStatus";
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
import { getToken } from "next-auth/jwt";
import AttachmentItemEditable from "components/NewSyllabus/AttachmentItemEditable";
import NotFound from "components/commons/NotFound";
import Router from "next/router";

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const syllId = context.query.sid
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const t = await getToken({ req: context.req, secret: process.env.NEXTAUTH_SECRET })

  const token = t ? (t.user as { _id: string, token: string }).token : '';
  const user_uuid = t ? (t.user as { _id: string, token: string })._id : '';
  const url = new URL(`syllabi/${syllId}`, apiUrl);

  const h = new Headers();
  if (t)
    h.append("Authorization", `Bearer ${token}`);

  const res = await fetch(url, { headers: h });
  if (res.ok) {
    const info = await res.json();

    if (info.user_uuid !== user_uuid)
      return { props: {} }

    return {
      props: {
        syllabusInfo: info
      }
    };
  } else {
    return {
      props: {},
    };
  }

};

interface IEditSyllabusProps {
  syllabusInfo: ISyllabus
}

const EditSyllabus: NextPage<IEditSyllabusProps> = ({ syllabusInfo }) => {
  const { data: session, status } = useSession();
  const [validated, setValidated] = useState(false);
  const [errors, setErrors] = useState(Array);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [syllabusCreated, setSyllabusCreated] = useState("pending");
  const [institutionCreated, setInstitutionCreated] = useState("pending");
  const [attachmentsCreated, setAttachmentsCreated] = useState("pending");
  const [syllabusUUID, setSyllabusUUID] = useState("");
  const [parsedData, setParsedData] = useState<IParsedData>();

  const [formData, setFormData] = useState<IFormData>({
    institutions: syllabusInfo.institutions as IInstitution[],
    title: syllabusInfo.title,
    course_number: syllabusInfo.course_number as string,
    description: syllabusInfo.description,
    attachments: syllabusInfo.attachments as IAttachment[],
    tags: syllabusInfo.tags as string[],
    language: syllabusInfo.language,
    learning_outcomes: syllabusInfo.learning_outcomes as string[],
    topic_outlines: syllabusInfo.topic_outlines as string[],
    readings: syllabusInfo.readings as string[],
    grading_rubric: syllabusInfo.grading_rubric as string,
    assignments: syllabusInfo.assignments as string[],
    other: syllabusInfo.other as string,
    status: syllabusInfo.status,
    academic_fields: syllabusInfo.academic_fields.map(ac => { return ac.toString() }),
    academic_level: syllabusInfo.academic_level as number,
    duration: syllabusInfo.duration as number,
  });

  const [institutionData, setInstitutionData] = useState<IFormInstitution>({} as IFormInstitution);
  useEffect(() => {
    setInstitutionData({
      name: syllabusInfo.institutions && syllabusInfo.institutions.length > 0 ? syllabusInfo.institutions[0].name : "",
      country: syllabusInfo.institutions && syllabusInfo.institutions.length > 0 ? syllabusInfo.institutions[0].country as unknown as string : "",
      url: syllabusInfo.institutions && syllabusInfo.institutions.length > 0 ? syllabusInfo.institutions[0].url as string : "",
      date_year: syllabusInfo.institutions && syllabusInfo.institutions.length > 0 ? syllabusInfo.institutions[0].date.year : "",
      date_term: syllabusInfo.institutions && syllabusInfo.institutions.length > 0 ? syllabusInfo.institutions[0].date.term as string : "",
    })
  }, [])  

  //Handle form submission
  const handleSubmit = async (event: React.BaseSyntheticEvent) => {
    event.preventDefault();
    event.stopPropagation();

    if (session == null || session.user == null) {
      Router.push("/auth/signin")
      return;
    }

    const validForm = isValidForm(formData, attachmentData, institutionData);
    if (validForm.errors.length > 0) {
      setErrors(validForm.errors);
      return;
    }

    const h = new Headers();
    h.append("Authorization", `Bearer ${session.user.token}`);

    const syll_endpoint = new URL(`syllabi/${syllabusInfo.uuid}`, process.env.NEXT_PUBLIC_API_URL)
    const res = await submitForm(formData, syll_endpoint, "PATCH", h);
    setFormSubmitted(true);
    if (res.status !== 200) {
      const err = await res.text();
      setErrors([err]);
      setSyllabusCreated("failed");
      return;
    }

    const body = await res.json();
    setSyllabusCreated("created");
    setSyllabusUUID(body.uuid);

    //-- if the syllabus has no institutions, add one
    //-- otherwise, edit the existing one
    let instit_endpoint, method: string = '';
    if (syllabusInfo && syllabusInfo.institutions && syllabusInfo.institutions.length === 0) {
      instit_endpoint = new URL(
        `/syllabi/${body.uuid}/institutions`,
        process.env.NEXT_PUBLIC_API_URL
      );
      method = 'POST'
    } else if (syllabusInfo && syllabusInfo.institutions && syllabusInfo.institutions.length === 1) {
      instit_endpoint = new URL(
        `/syllabi/${body.uuid}/institutions/${syllabusInfo.institutions[0].uuid}`,
        process.env.NEXT_PUBLIC_API_URL
      );
      method = 'PATCH'
    } else {
      console.warn("Unexpected number of institutions:", syllabusInfo.institutions)
      setInstitutionCreated("failed")
      return;
    }

    submitInstitution(institutionData, instit_endpoint, method, h).then(
      (res) => {
        if (res.status === 200) {
          setInstitutionCreated("created");
        } else {
          setInstitutionCreated("failed");
        }
      }
    );


    //-- edits to existing attachments are handled separately. here we add new attachments only
    //-- todo: currently, existing attachments are being recreated
    if (newAttachmentData.length === 0) {
      setAttachmentsCreated("created");
      return;
    }
    const attach_endpoint = new URL(
      `/attachments/?syllabus_id=${body.uuid}`,
      process.env.NEXT_PUBLIC_API_URL
    );
    newAttachmentData.map((att) => {
      submitAttachments(att, attach_endpoint, "POST", h).then((res) => {
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
    setInstitutionData({...institutionData});
  };

  const setAcadFieldsData = (acadFieldsArray: string[]) => {
    setFormData({ ...formData, ["academic_fields"]: acadFieldsArray });
  };

  const [attachmentData, setAttachmentData] = useState(
    syllabusInfo.attachments ? syllabusInfo.attachments.map((att, i) => {
      att.id = i.toString()
      att.type = att.url ? att.url.startsWith("http") ? "url" : "file" : "file"
      return att
    }) : []
  );

  const [newAttachmentData, setNewAttachmentData] = useState<IAttachment[]>([])

  //display elements for attachment
  const getExistingAttachments = (attachmentData: IAttachment[]) => {
    const uploadedAttachments = attachmentData.map((attachment) => (
      <AttachmentItemEditable
        key={`attachment-editable-${attachment.id}`}
        attachment={attachment}
      />
    ));
    return uploadedAttachments;
  };

  const getNewAttachments = (attachmentData: IAttachment[]) => {
    const uploadedAttachments = attachmentData.map((attachment) => (
      <AttachmentItem
        key={`attachment-new-${attachment.id}`}
        attachment={attachment}
        attachmentData={newAttachmentData}
        setAttachmentData={setNewAttachmentData}
      />
    ));
    return uploadedAttachments;
  };

  if (!syllabusInfo || Object.keys(syllabusInfo).length === 0) {
    return (<NotFound />)
  }

  //if submitted, show progress and status confirmation
  if (status === "authenticated" && formSubmitted === true) {
    return (
      <>
        <div className="w-11/12 md:w-10/12 m-auto mt-8">
          <div className="pt-3 pb-3">
            <div className="col-8 offset-2">
              {syllabusCreated === "created" &&
                attachmentsCreated === "created" &&
                institutionCreated === "created" ? (
                <>
                  <h1 className="text-2xl my-8">Success!</h1>
                  <div>
                    View{" "}
                    <Link href={`/syllabus/${syllabusUUID}`} className="underline">
                      {formData.title} here
                    </Link>
                    .
                  </div>
                </>
              ) : (
                <>
                  <h1 className="text-2xl my-8">Saving...</h1>
                  <ul>
                    <SyllabusCreationStatus status={syllabusCreated} />
                    <InstitutionCreationStatus status={institutionCreated} />
                    <AttachmentsCreationStatus status={attachmentsCreated} />
                  </ul>
                  <div onClick={() => Router.reload()} className="mt-8 underline cursor-pointer">Back to editing</div>
                </>
              )}
            </div>
          </div>
        </div>
      </>
    );
  }
  if (status === "authenticated" && formSubmitted === false) {
    //if user is logged in, show form
    return (
      <>

        <div className="w-11/12 md:w-10/12 m-auto mt-8">
          <div className="pt-3 pb-3">
            <div className="col-8 offset-2">
              <h1 className={`${kurintoSerif.className} text-3xl`}>Edit Syllabus - <Link href={`/syllabus/${syllabusInfo.uuid}`} target="_blank" className="underline">{syllabusInfo.title}</Link></h1>
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
                        name="name"
                        value={institutionData.name}
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
                      name="country"
                      value={institutionData.country}
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
                        value={institutionData.url}
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
                          value={institutionData.date_year}
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
                          value={institutionData.date_term}
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
                  academicFields={formData.academic_fields}
                  setAcadFieldsData={setAcadFieldsData}
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
                    value={formData.language.toUpperCase()}
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
                      value={formData.duration}
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
                    value={formData.tags.join(", ")}
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
                    value={formData.description}
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
                    value={formData.learning_outcomes}
                    placeholder="Course learning outcomes..."
                    data-cy="courseLearningOutcomes"
                  />
                </div>

                <div className="flex flex-col my-8 gap-2">
                  <label htmlFor="topic_outlines">
                    Topics
                  </label>
                  <textarea
                    className="bg-transparent mt-2 p-1 border border-gray-900"
                    id="topic_outlines"
                    onChange={handleChange}
                    rows={4}
                    value={formData.topic_outlines}
                    placeholder="Course topics outline..."
                    data-cy="courseTopicsOutline"
                  />
                </div>

                <div className="flex flex-col my-8 gap-2">
                  <label htmlFor="readings">Readings</label>
                  <textarea
                    className="bg-transparent mt-2 p-1 border border-gray-900"
                    id="readings"
                    onChange={handleChange}
                    rows={4}
                    value={formData.readings}
                    placeholder="Course readings..."
                    data-cy="courseReadings"
                  />
                </div>

                <div className="flex flex-col my-8 gap-2">
                  <label htmlFor="grading_rubric">
                    Grading Rubric
                  </label>
                  <textarea
                    className="bg-transparent mt-2 p-1 border border-gray-900"
                    id="grading_rubric"
                    onChange={handleChange}
                    rows={4}
                    value={formData.grading_rubric as string}
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
                    value={formData.assignments}
                    placeholder="Course assignments..."
                    data-cy="courseAssignments"
                  />
                </div>

                <hr className="my-12 border border-gray-300" />

                <div className="mb-5">
                  <h2 className="text-xl">
                    Attachments ({attachmentData.length})
                  </h2>
                  {getExistingAttachments(attachmentData)}
                  {getNewAttachments(newAttachmentData)}
                  <NewSyllabusAttachment
                    attachmentData={newAttachmentData}
                    setAttachmentData={setNewAttachmentData}
                  />
                </div>

                <button onClick={handleSubmit} data-cy="courseSubmitButton" className="p-2 bg-gray-900 text-gray-100 border-2 rounded-md">
                  Save changes
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
  }

  //else, user is not logged in, show prompt
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
};

export default EditSyllabus;
