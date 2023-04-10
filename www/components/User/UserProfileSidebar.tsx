import * as React from "react";

import UserLinks from "components/User/UserLinks";
import UserInstitutions from "components/User/UserInstitutions";

import Col from "react-bootstrap/Col";

import { IUser, ICollection, IInstitution, ISyllabus } from "types";
import UserBio from "./UserBio";
import UserEducation from "./UserEducation";
import UserEmail from "./UserEmail";
import UserName from "./UserName";
import UserPassword from "./UserPassword";
import UserDelete from "./UserDelete";

const getinstitutionNames = (
  institutionsArray: IInstitution[] | undefined
): string[] => {
  let instutionNames = [];
  if (institutionsArray) {
    for (let i = 0; i < institutionsArray.length; i++) {
      const name = institutionsArray[i].name;
      instutionNames.push(name);
    }
  }
  return instutionNames;
};

interface IUserProfileSidebarProps {
  props: IUser;
  apiUrl: string;
  isAdmin: boolean;
}

const UserProfileSidebar: React.FunctionComponent<IUserProfileSidebarProps> = ({
  props,
  apiUrl,
  isAdmin,
}) => {
  return (
    <Col lg={isAdmin ? "4" : "3"}>
      <div id="user-profile" className="py-4">
        <div id="user-description" className="pb-4">
          <UserName userName={props.name} isAdmin={isAdmin} apiUrl={apiUrl} />
          <UserBio userBio={props.bio} isAdmin={isAdmin} apiUrl={apiUrl} />
          <UserLinks userLinks={props.urls as Array<string>} isAdmin={isAdmin} apiUrl={apiUrl} />
        </div>
        <UserInstitutions
          institutions={getinstitutionNames(props.institutions)}
          isAdmin={isAdmin} apiUrl={apiUrl}
        />
        <UserEducation userEducation={props.education as Array<string>} isAdmin={isAdmin} apiUrl={apiUrl} />
        {isAdmin ?
          <div>
            <h4>User details</h4>
            <div>
              <UserEmail userEmail={props.email} apiUrl={apiUrl} />
              <UserPassword apiUrl={apiUrl}/>
              <UserDelete apiUrl={apiUrl}/>
            </div>
          </div>
          :
          <></>}

      </div>
    </Col>
  );
};

export default UserProfileSidebar;
