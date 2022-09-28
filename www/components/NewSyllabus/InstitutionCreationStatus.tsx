import * as React from "react";

interface IInstitutionCreationStatusProps {
  status: string;
}

const InstitutionCreationStatus: React.FunctionComponent<
  IInstitutionCreationStatusProps
> = ({ status }) => {
  switch (status) {
    case "pending":
      return (
        <li>
          <em>Adding institution info...</em>
        </li>
      );
    case "created":
      return <li>Institution info added.</li>;
    case "failed":
      return <li>Error adding institution info.</li>;
    default:
      return <></>;
  }
};

export default InstitutionCreationStatus;
