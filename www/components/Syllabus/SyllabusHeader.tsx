import { getAcademicLevelText } from "components/utils/getAcademicLevel";
import { getAcademicFieldsText } from "components/utils/getAcademicFields";

import { inter } from "app/layout";
import { useEffect, useState } from "react";
import { ISyllabus } from "types";
import { getInstitutionName, getInstitutionCountry, getInstitutionLang, getInstitutionYearInfo, getInstitutionTermInfo } from "components/utils/getInstitutionInfo";

interface ISyllabusSchoolCodeYearProps {
  syllabusInfo: ISyllabus
}

const SyllabusSchoolCodeYear: React.FunctionComponent<
  ISyllabusSchoolCodeYearProps
> = ({ syllabusInfo }) => {
  const [institution, setInstitution] = useState<string>()
  const [lang, setLang] = useState<string>()
  const [country, setCountry] = useState<string>()
  const [courseNumber, setCourseNumber] = useState<string>()
  const [level, setLevel] = useState<string>()
  const [fields, setFields] = useState<string[]>()
  const [term, setTerm] = useState<string>()
  const [year, setYear] = useState<string>()  

  useEffect(() => {
    if (!syllabusInfo) return

    setInstitution(getInstitutionName(syllabusInfo.institutions) as string)
    setCountry(getInstitutionCountry(syllabusInfo.institutions) as string)
    setYear(getInstitutionYearInfo(syllabusInfo.institutions) as string)
    setTerm(getInstitutionTermInfo(syllabusInfo.institutions) as string)

    setLang(getInstitutionLang(syllabusInfo.language))
    setCourseNumber(syllabusInfo.course_number)
    setLevel(getAcademicLevelText(syllabusInfo.academic_level) as string)
    setFields(getAcademicFieldsText(syllabusInfo.academic_fields))
  }, [syllabusInfo])

  return (
    <div className={`flex flex-col md:flex-row gap-4 text-sm mb-4 ${inter.className} text-gray-600`}>
      <div className="flex flex-row justify-between md:gap-4">
        <div className="flex flex-col sm:flex-row justify-between md:gap-4">
          {institution ? (
            <div className="">{institution}{country ? ` (${country})` : ''}</div>
          ) : (
            <div className="italic">No institution</div>
          )}

          {lang ? (
            <div className="">{lang}</div>
          ) : (
            <div className="italic">No language</div>
          )}
        </div>
        {/* {courseNumber ? (
        <p className="">{courseNumber}</p>
      ) : (
        <p className="">
          <em>no course code</em>
        </p>
      )} */}

        <div className="flex flex-col sm:flex-row justify-between md:gap-4">
          {year ? (
            <div className="">{term ? `${term} ` : ''}{year}</div>
          ) : (
            <div className="italic">No date</div>
          )}

          {level != null ? (
            <div className="">{level}</div>
          ) : (
            <div className="">
              <em>No academic level</em>
            </div>
          )}
        </div>
      </div>

      {fields != null ? (
        <div className="">{fields.join(" | ")}</div>
      ) : (
        <div className="">
          <em>No academic fields</em>
        </div>
      )}
    </div>
  );
};

export default SyllabusSchoolCodeYear;
