import { getAcademicLevelText } from "components/utils/getAcademicLevel";
import * as React from "react";

interface ISyllabusSchoolCodeYearProps {
  institution?: string | null;
  courseNumber?: string | null;
  academicLevel?: number | null;
  term?: string | null;
  year?: string | null;
}

const SyllabusSchoolCodeYear: React.FunctionComponent<
  ISyllabusSchoolCodeYearProps
> = ({ institution, courseNumber, academicLevel, term, year }) => {
  return (
    <div className="d-flex gap-3">
      {institution ? (
        <p className="small">{institution}</p>
      ) : (
        <p className="small text-muted">
          <em>institution</em>
        </p>
      )}

      {academicLevel ? (
        <p className="small">{getAcademicLevelText(academicLevel)}</p>
      ) : (
        <p className="small text-muted">
          <em>academic level</em>
        </p>
      )}

      {courseNumber ? (
        <p className="small">{courseNumber}</p>
      ) : (
        <p className="small text-muted">
          <em>no course code</em>
        </p>
      )}

      <div className="d-flex gap-1">
        {term ? (
          <p className="small">{term}</p>
        ) : (
          <p className="small text-muted">
            <em>term</em>
          </p>
        )}
        {year ? (
          <p className="small">{year}</p>
        ) : (
          <p className="small text-muted">
            <em>year</em>
          </p>
        )}
      </div>
    </div>
  );
};

export default SyllabusSchoolCodeYear;
