import * as React from "react";
import Link from "next/link";
import type { GetStaticProps } from "next";

import Card from "react-bootstrap/Card";
import SyllabusSchoolCodeYear from "components/Syllabus/SyllabusSchoolCodeYear";
import Tags from "./Tags";
import PubBadge from "./PubBadge";
import { getServerSideProps } from "pages";

interface ISyllabusCardProps {
  uuid: string;
  status: string;
  institution?: string;
  courseNumber?: string;
  term?: string;
  year?: string;
  title: string;
  author?: string;
  authorUUID: string;
  description: string;
  tags?: string[];
}

const SyllabusCard: React.FunctionComponent<ISyllabusCardProps> = (props) => {
  const getSyllabiUrl = (uuid: string) => {
    return "/syllabus/" + uuid;
  };

  const getUserUrl = (uuid: string) => {
    //-- TODO switch from user to userS
    return "/user/" + uuid;
  };

  const getVisbility = (status: string) => {
    if (status === "unlisted") {
      return false;
    } else if (status === "listed") {
      return true;
    } else {
      return null;
    }
  };

  return (
    <Card data-cy="syllabusCard">
      <Card.Body>
        <SyllabusSchoolCodeYear
          institution={props.institution}
          courseNumber={props.courseNumber}
          term={props.term}
          year={props.year}
        />
        <Card.Title>
          <Link href={getSyllabiUrl(props.uuid)}>
            <a>{props.title}</a>
          </Link>
          {/* TODO: make public /private tags display only if logged in */}
          <PubBadge isPublic={getVisbility(props.status)} />
        </Card.Title>
        <div className="course-author">
          {props.author ? (
            <p>
              <Link href={getUserUrl(props.authorUUID)}>{props.author}</Link>
            </p>
          ) : (
            <p className="text-muted">
              <em>Author goes here</em>
            </p>
          )}
        </div>
        <Card.Text className="course-description">
          {props.description}
        </Card.Text>
        <div className="course-tags d-flex gap-2">
          {props.tags && <Tags tags={props.tags} />}
        </div>
      </Card.Body>
    </Card>
  );
};

export default SyllabusCard;
