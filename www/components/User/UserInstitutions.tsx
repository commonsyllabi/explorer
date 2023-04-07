import * as React from "react";
import { IInstitution } from "types";

interface IUserInstitutionsProps {
  institutions: string | string[] | undefined,
  isAdmin: boolean,
  apiUrl: string,
}

const UserInstitutions: React.FunctionComponent<IUserInstitutionsProps> = ({
  institutions,
  isAdmin, apiUrl
}) => {
  // if no data
  if (institutions === undefined || institutions === null) {
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
    return (
      <div id="user-teaches-at" className="py-4">
        <h3 className="h6">Institutions</h3>
        <div className="user-institutions-item mb-3 text-muted">
          <div>No institutions specified</div>
        </div>
      </div>
    );
  }
  const UserInstitutionsEls = institutions.map((item) => (
    <li key={item}>{item}</li>
  ));
  return (
    <div id="user-teaches-at" className="py-4">
      <h3 className="h6">Institutions</h3>
      <div className="user-institutions-item mb-3">
        <ul className="list-unstyled">{UserInstitutionsEls}</ul>
      </div>
    </div>
  );
};

export default UserInstitutions;
