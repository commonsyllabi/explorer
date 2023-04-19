import { getAcademicLevelText } from "components/utils/getAcademicLevel";
import { getAcademicFieldsText } from "components/utils/getAcademicFields";
import * as React from "react";
import { inter } from "app/layout";

interface ISyllabusSchoolCodeYearProps {
  institution?: string | null;
  lang?: string | null;
  country?: string | null;
  courseNumber?: string | null;
  level?: number | null;
  fields?: number[] | null;
  term?: string | null;
  year?: string | null;
}

const SyllabusSchoolCodeYear: React.FunctionComponent<
  ISyllabusSchoolCodeYearProps
> = ({ institution, lang, country, courseNumber, level, fields, term, year }) => {
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
            <div className="">{getAcademicLevelText(level)}</div>
          ) : (
            <div className="">
              <em>No academic level</em>
            </div>
          )}
        </div>
      </div>

      {fields != null ? (
        <div className="">{getAcademicFieldsText(fields).join(" | ")}</div>
      ) : (
        <div className="">
          <em>No academic fields</em>
        </div>
      )}
    </div>
  );
};

export default SyllabusSchoolCodeYear;
