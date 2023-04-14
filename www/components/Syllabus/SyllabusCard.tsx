import * as React from "react";
import Link from "next/link";

import SyllabusHeader from "components/Syllabus/SyllabusHeader";
import Tags from "./Tags";
import PubBadge from "../commons/PubBadge";

import { getSyllabiUrl, getUserUrl } from "components/utils/getLinks";
import {
  getInstitutionName,
  getInstitutionTermInfo,
  getInstitutionYearInfo,
} from "components/utils/getInstitutionInfo";

import { ISyllabus } from "types";
import { kurintoBook, kurintoSerif } from "app/layout";


interface ISyllabusCardProps {
  userName?: string;
  syllabusInfo: ISyllabus;
  isAdmin: boolean;
}

const SyllabusCard: React.FunctionComponent<ISyllabusCardProps> = ({
  syllabusInfo,
  userName,
  isAdmin,
}) => {


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
    } else if (syllabusInfo.user.name) {
      return syllabusInfo.user.name;
    } else {
      return null;
    }
  };

  return (
    <div data-cy="syllabusCard" className="border-2 border-gray-600 rounded-lg p-3">

      <div>
        <SyllabusHeader
          institution={getInstitutionName(syllabusInfo.institutions)}
          courseNumber={syllabusInfo.course_number ? syllabusInfo.course_number : null}
          term={getInstitutionTermInfo(syllabusInfo.institutions)}
          year={getInstitutionYearInfo(syllabusInfo.institutions)}
          level={syllabusInfo.academic_level}
          fields={syllabusInfo.academic_fields}
        />
        <div>
          <div className="flex justify-between w-full mt-6 mb-2">
            <Link href={getSyllabiUrl(syllabusInfo.uuid)} className={`text-xl font-bold hover:underline ${kurintoBook.className}`}>
              {syllabusInfo.title}
            </Link>
            {isAdmin ?
              <PubBadge isPublic={getVisbility(syllabusInfo.status)} />
              : null}
          </div>
        </div>
        <div className={`${kurintoSerif.className} mb-6`}>
          <Link href={getUserUrl(syllabusInfo.user_uuid)}>{getUserName()}</Link>
        </div>
        <div className="course-description whitespace-pre-wrap">
          {syllabusInfo.description}
        </div>
        <div className="mt-6 mb-2 flex gap-2">
          {syllabusInfo.tags && <Tags tags={syllabusInfo.tags} />}
        </div>
      </div>
    </div>
  );
};

export default SyllabusCard;
