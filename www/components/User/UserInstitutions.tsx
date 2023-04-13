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

  const UserInstitutionsEls = institutions.map((item) => (
    <li key={item}>{item}</li>
  ));
  return (
    <div id="user-teaches-at" className="py-4">
      <h3 className="text-lg">Institutions</h3>
      <div className="user-institutions-item mb-3">
        {institutions.length === 0 ?
          <div>No institutions specified</div>
          :
          <ul className="list-unstyled">{UserInstitutionsEls}</ul>
        }
      </div>
    </div>
  );
};

export default UserInstitutions;
