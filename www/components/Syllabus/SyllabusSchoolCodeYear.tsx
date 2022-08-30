import * as React from "react";

interface ISyllabusSchoolCodeYearProps {
  institution?: string;
  courseNumber?: string;
  term?: string;
  year?: string;
}

const SyllabusSchoolCodeYear: React.FunctionComponent<
  ISyllabusSchoolCodeYearProps
> = ({ institution, courseNumber, term, year }) => {
  return (
    <div className="d-flex gap-3">
      {institution ? (
        <p className="small">{institution}</p>
      ) : (
        <p className="small text-muted">
          <em>institution</em>
        </p>
      )}

      {courseNumber ? (
        <p className="small">{courseNumber}</p>
      ) : (
        <p className="small text-muted">
          <em>course code</em>
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
