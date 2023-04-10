import * as React from "react";
import Link from "next/link";
import type { GetStaticProps } from "next";

import Card from "react-bootstrap/Card";
import SyllabusHeader from "components/Syllabus/SyllabusHeader";
import Tags from "./Tags";
import PubBadge from "./PubBadge";
import { getServerSideProps } from "pages";

import { getSyllabiUrl, getUserUrl } from "components/utils/getLinks";
import {
  getInstitutionName,
  getInstitutionTermInfo,
  getInstitutionYearInfo,
} from "components/utils/getInstitutionInfo";

import { ISyllabus } from "types";
import { Button } from "react-bootstrap";
import { useState } from "react";
import { signOut, useSession } from "next-auth/react";
import Router from "next/router";

interface ISyllabusCardProps {
  userName?: string;
  data: ISyllabus;
  isAdmin: boolean;
}

const SyllabusCard: React.FunctionComponent<ISyllabusCardProps> = ({
  data,
  userName,
  isAdmin,
}) => {
  const { data: session } = useSession();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [modalMessage, setModalMessage] = useState("")

  const getVisbility = (status: string) => {
    if (status === "unlisted") {
      return false;
    } else if (status === "listed") {
      return true;
    } else {
      return null;
    }
  };

  const getUserName = () => {
    if (userName) {
      return userName;
    } else if (data.user.name) {
      return data.user.name;
    } else {
      return null;
    }
  };

  const deleteSyllabus = () => {
    const h = new Headers();
    h.append("Authorization", `Bearer ${session?.user.token}`);

    fetch(new URL(`/syllabi/${data.uuid}`, apiUrl),
      {
        method: 'DELETE',
        headers: h
      })
      .then(res => {
        if (res.ok) {
          setModalMessage(`${data.title} was successfully deleted!`)
        } else if (res.status == 401) {
          signOut({ redirect: false }).then((result) => {
            Router.push("/auth/signin");
          })
          return res.text()
        } else {
          return res.text()
        }
      })
      .then(body => {
        setModalMessage(`There was an error deleting your syllabus (${body}). Please try again later.`)
      })

  }

  return (
    <Card data-cy="syllabusCard">
      {showDeleteModal ? <div className="d-flex flex-column justify-content-between right-30 border-black position-absolute bg-white p-5 w-100 h-100">
        <h2>Watch out!</h2>
        <div>You are about to delete <b>{data.title}</b>.</div>
        <div>{modalMessage}</div>
        <div className="d-flex justify-content-between mt-3">
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>close</Button>
          <Button variant="danger" onClick={deleteSyllabus} disabled={modalMessage !== ""}>delete</Button>
        </div>
      </div>

        : <></>}
      <Card.Body>
        <SyllabusHeader
          institution={getInstitutionName(data.institutions)}
          courseNumber={data.course_number ? data.course_number : null}
          term={getInstitutionTermInfo(data.institutions)}
          year={getInstitutionYearInfo(data.institutions)}
          level={data.academic_level}
          fields={data.academic_fields}
        />
        <Card.Title>
          <div className="d-flex justify-content-between w-100 align-items-center">
            <Link href={getSyllabiUrl(data.uuid)}>
              {data.title}
            </Link>
            {isAdmin ?
              <PubBadge isPublic={getVisbility(data.status)} />
              : null}
          </div>
        </Card.Title>
        <div className="course-author">
          {getUserName() ? (
            <p>
              <Link href={getUserUrl(data.user_uuid)}>{getUserName()}</Link>
            </p>
          ) : (
            <p className="text-muted">
              <em>Anonymous</em>
            </p>
          )}
        </div>
        <Card.Text className="course-description" style={{ whiteSpace: "pre-wrap" }}>
          {data.description}
        </Card.Text>
        <div className="course-tags d-flex gap-2">
          {data.tags && <Tags tags={data.tags} />}
        </div>
        {isAdmin ? <div className="controls mt-3 d-flex justify-content-end">
          <Button variant="danger" onClick={() => setShowDeleteModal(true)}>Delete</Button>
        </div> : <></>}
      </Card.Body>
    </Card>
  );
};

export default SyllabusCard;
