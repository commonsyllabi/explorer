import { getAcademicLevelText } from "components/utils/getAcademicLevel";
import { getAcademicFieldsText } from "components/utils/getAcademicFields";
import * as React from "react";
import { inter } from "app/layout";

interface ISyllabusSchoolCodeYearProps {
  institution?: string | null;
  courseNumber?: string | null;
  level?: number | null;
  fields?: number[] | null;
  term?: string | null;
  year?: string | null;
}

const SyllabusSchoolCodeYear: React.FunctionComponent<
  ISyllabusSchoolCodeYearProps
> = ({ institution, courseNumber, level, fields, term, year }) => {
  return (
    <div className={`flex flex-col gap-1 md:flex-row md:gap-4 text-sm mb-4 ${inter.className} text-gray-600`}>
      {institution ? (
        <p className="">{institution}</p>
      ) : (
        <div className="italic">institution</div>
      )}

      {/* {courseNumber ? (
        <p className="">{courseNumber}</p>
      ) : (
        <p className="">
          <em>no course code</em>
        </p>
      )} */}

      <div className="">
        {term ? (
          <p className="">{term}</p>
        ) : (
          <div className="italic">term</div>
        )}
      </div>

      <div>
        {year ? (
          <p className="">{year}</p>
        ) : (
          <div className="italic">year</div>
        )}
      </div>

      {level != null ? (
        <p className="">{getAcademicLevelText(level)}</p>
      ) : (
        <p className="">
          <em>no academic level</em>
        </p>
      )}

      {fields != null ? (
        <p className="">{getAcademicFieldsText(fields).join(" | ")}</p>
      ) : (
        <p className="">
          <em>no academic fields</em>
        </p>
      )}
    </div>
  );
};

export default SyllabusSchoolCodeYear;
