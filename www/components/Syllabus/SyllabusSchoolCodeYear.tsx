import * as React from "react";

interface ISyllabusSchoolCodeYearProps {
  institution: string;
  code: string;
  year: string;
}

const SyllabusSchoolCodeYear: React.FunctionComponent<
  ISyllabusSchoolCodeYearProps
> = ({ institution, code, year }) => {
  return (
    <div className="d-flex gap-3">
      <p className="small">{institution}</p>
      <p className="small">{code}</p>
      <p className="small">{year}</p>
    </div>
  );
};

export default SyllabusSchoolCodeYear;
