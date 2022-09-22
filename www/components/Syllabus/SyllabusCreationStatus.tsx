import * as React from "react";

interface ISyllabusCreationStatusProps {
  status: string;
}

const SyllabusCreationStatus: React.FunctionComponent<
  ISyllabusCreationStatusProps
> = ({ status }) => {
  switch (status) {
    case "pending":
      return (
        <li>
          <em>Setting core course info...</em>
        </li>
      );
    case "created":
      return <li>Core course info created.</li>;
    case "failed":
      return <li>Error creating syllabus.</li>;
    default:
      return <></>;
  }
};

export default SyllabusCreationStatus;
