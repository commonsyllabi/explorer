import * as React from "react";
import Link from "next/link";

import SyllabusHeader from "components/Syllabus/SyllabusHeader";
import Tags from "./Tags";
import PubBadge from "../commons/PubBadge";

import { getSyllabiUrl, getUserUrl } from "components/utils/getLinks";
import {
  getInstitutionCountry,
  getInstitutionLang,
  getInstitutionName,
  getInstitutionTermInfo,
  getInstitutionYearInfo,
} from "components/utils/getInstitutionInfo";

import { ISyllabus } from "types";
import { kurintoBook, kurintoSerif } from "app/layout";


interface ISyllabusCardProps {
  syllabusInfo: ISyllabus;
  isAdmin: boolean;
}

const SyllabusCard: React.FunctionComponent<ISyllabusCardProps> = ({
  syllabusInfo,
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

  return (
    <div data-cy="syllabusCard" className="border-2 border-gray-600 rounded-lg p-3">

      <div>
        <SyllabusHeader syllabusInfo={syllabusInfo} isAdmin={false}/>
        <div>
          <div className="flex justify-between w-full mt-8 mb-4">
            <Link href={getSyllabiUrl(syllabusInfo.uuid)} className={`text-2xl w-full font-bold hover:underline ${kurintoBook.className}`}>
              {syllabusInfo.title}
            </Link>
            {isAdmin ?
              <div className="flex flex-col justify-end items-end">
                <PubBadge isPublic={getVisbility(syllabusInfo.status)} />
                <div className="text-xs sm:text-sm text-gray-500 text-right">{syllabusInfo.uuid}</div>
              </div>
              : null}
          </div>
        </div>
        <div className={`${kurintoSerif.className} mb-6`}>
          <Link href={getUserUrl(syllabusInfo.user_uuid)}>{syllabusInfo.user.name}</Link>
        </div>
        <div className="course-description whitespace-pre-wrap">
          {syllabusInfo.description}
        </div>
        <div className="mt-6 mb-2 flex gap-2">
          <Tags tags={syllabusInfo.tags} />
        </div>
      </div>
    </div>
  );
};

export default SyllabusCard;
