import { getAcademicLevelText } from "components/utils/getAcademicLevel";
import { getAcademicFieldsText } from "components/utils/getAcademicFields";
import * as React from "react";

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
    <div className="flex gap-3">
      {institution ? (
        <p className="text-sm">{institution}</p>
      ) : (
        <p className="small text-muted">
          <em>institution</em>
        </p>
      )}

      {/* {courseNumber ? (
        <p className="text-sm">{courseNumber}</p>
      ) : (
        <p className="small text-muted">
          <em>no course code</em>
        </p>
      )} */}

      <div className="flex gap-1">
        {term ? (
          <p className="text-sm">{term}</p>
        ) : (
          <p className="small text-muted">
            <em>term</em>
          </p>
        )}
        {year ? (
          <p className="text-sm">{year}</p>
        ) : (
          <p className="small text-muted">
            <em>year</em>
          </p>
        )}
      </div>

      {level != null ? (
          <p className="text-sm">{getAcademicLevelText(level)}</p>
        ) : (
          <p className="small text-muted">
            <em>no academic level</em>
          </p>
        )}

{fields != null ? (
          <p className="text-sm">{getAcademicFieldsText(fields).join(" | ")}</p>
        ) : (
          <p className="small text-muted">
            <em>no academic fields</em>
          </p>
        )}
    </div>
  );
};

export default SyllabusSchoolCodeYear;
