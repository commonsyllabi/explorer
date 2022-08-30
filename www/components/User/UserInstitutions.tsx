import * as React from "react";
import { IInstitution } from "types";

interface IUserInstitutionsProps {
  institutions: string | string[] | undefined;
}

const UserInstitutions: React.FunctionComponent<IUserInstitutionsProps> = ({
  institutions,
}) => {
  // if no data
  if (institutions === undefined) {
    return null;
  }
  // if data is a single string
  if (typeof institutions === "string") {
    return (
      <div className="user-institutions-item mb-3">
        <ul className="list-unstyled">
          <li>{institutions}</li>
        </ul>
      </div>
    );
  }

  // if data is array
  if (institutions.length < 1) {
    return null;
  }
  const UserInstitutionsEls = institutions.map((item) => (
    <li key={item}>{item}</li>
  ));
  return (
    <div className="user-institutions-item mb-3">
      <ul className="list-unstyled">{UserInstitutionsEls}</ul>
    </div>
  );
};

export default UserInstitutions;
