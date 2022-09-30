import * as React from "react";
import Link from "next/link";
import type { GetStaticProps } from "next";

import Card from "react-bootstrap/Card";
import SyllabusSchoolCodeYear from "components/Syllabus/SyllabusSchoolCodeYear";
import Tags from "./Tags";
import PubBadge from "./PubBadge";
import { getServerSideProps } from "pages";

import { getSyllabiUrl, getUserUrl } from "components/utils/getLinks";

import { ISyllabus } from "types";

interface ISyllabusCardProps {
  userName?: string;
  props: ISyllabus;
  isAdmin: boolean;
}

const SyllabusCard: React.FunctionComponent<ISyllabusCardProps> = ({
  props,
  userName,
  isAdmin,
}) => {
  // Helper functions to parse data to props
  const getVisbility = (status: string) => {
    if (status === "unlisted") {
      return false;
    } else if (status === "listed") {
      return true;
    } else {
      return null;
    }
  };

  const getInstitutionName = () => {
    if (props.institutions) {
      if (props.institutions[0]) {
        return props.institutions[0]["name"];
      }
      return null;
    }
    return null;
  };

  const getInstitutionTermInfo = () => {
    if (props.institutions) {
      if (props.institutions[0]) {
        if (props.institutions[0]["date"]) {
          if (props.institutions[0].date.term) {
            return props.institutions[0].date.term;
          }
          return null;
        }
        return null;
      }
      return null;
    }
    return null;
  };

  const getInstitutionYearInfo = () => {
    if (props.institutions) {
      if (props.institutions[0]) {
        if (props.institutions[0]["date"]) {
          return props.institutions[0].date.year;
        }
        return null;
      }
      return null;
    }
    return null;
  };

  const getUserName = () => {
    if (userName) {
      return userName;
    } else if (props.user.name) {
      return props.user.name;
    } else {
      return null;
    }
  };

  return (
    <Card data-cy="syllabusCard">
      <Card.Body>
        <SyllabusSchoolCodeYear
          institution={getInstitutionName()}
          courseNumber={props.course_number ? props.course_number : null}
          term={getInstitutionTermInfo()}
          year={getInstitutionYearInfo()}
          academicLevel={props.academic_level}
        />
        <Card.Title>
          <Link href={getSyllabiUrl(props.uuid)}>
            <a>{props.title}</a>
          </Link>
          {/* TODO: make public /private tags display only if logged in */}
          {isAdmin ? <PubBadge isPublic={getVisbility(props.status)} /> : null}
        </Card.Title>
        <div className="course-author">
          {getUserName() ? (
            <p>
              <Link href={getUserUrl(props.user_uuid)}>{getUserName()}</Link>
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
