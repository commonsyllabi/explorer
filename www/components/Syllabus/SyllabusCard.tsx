import Link from "next/link";

import SyllabusHeader from "components/Syllabus/SyllabusHeader";
import Tags from "./Tags";
import PubBadge from "../commons/PubBadge";

import { getSyllabiUrl, getUserUrl } from "components/utils/getLinks";
import { ISyllabus } from "types";
import { kurintoBook, kurintoSerif } from "app/layout";
import { useContext } from "react";
import { EditContext } from "context/EditContext";


interface ISyllabusCardProps {
  syllabusInfo: ISyllabus;
}

const SyllabusCard: React.FunctionComponent<ISyllabusCardProps> = ({
  syllabusInfo,
}) => {
  const ctx = useContext(EditContext)

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
        <EditContext.Provider value={{ isOwner: false }}>
          <SyllabusHeader syllabusInfo={syllabusInfo} />
        </EditContext.Provider>
        <div>
          <div className="flex justify-between w-full mt-8 mb-4" data-cy="syllabus-card-title">
            <Link href={getSyllabiUrl(syllabusInfo.uuid)} className={`text-2xl w-full font-bold hover:underline ${kurintoBook.className}`}>
              {syllabusInfo.title}
            </Link>
            {ctx.isOwner ?
              <div className="flex flex-col justify-end items-end">
                <PubBadge isPublic={getVisbility(syllabusInfo.status)} />
                <div className="text-xs sm:text-sm text-gray-500 text-right">{syllabusInfo.uuid}</div>
              </div>
              : null}
          </div>
        </div>
        <div className={`${kurintoSerif.className} mb-6`}>
          {syllabusInfo.instructors ? syllabusInfo.instructors.join(", ") : ''}
        </div>
        <div className="course-description whitespace-pre-wrap">
          {syllabusInfo.description}
        </div>
        <div className="flex flex-col md:flex-row mt-6 mb-2 gap-2 justify-between items-baseline">
          <Tags tags={syllabusInfo.tags} />
          <div className="text-sm">Uploaded by: <Link className="hover:underline" href={getUserUrl(syllabusInfo.user_uuid)}>{syllabusInfo.user.name}</Link></div>
        </div>
      </div>
    </div>
  );
};

export default SyllabusCard;
