import * as React from "react";

import UserLinks from "components/User/UserLinks";
import UserInstitutions from "components/User/UserInstitutions";

import { IUser, ICollection, IInstitution, ISyllabus } from "types";
import UserBio from "./UserBio";
import UserEducation from "./UserEducation";
import UserEmail from "./UserEmail";
import UserName from "./UserName";
import UserPassword from "./UserPassword";
import UserDelete from "./UserDelete";
import { useState } from "react";

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

  const [isShowingPasswordRecovery, setShowPasswordRecovery] = useState(false)
  return (

    <div id="user-profile" className="">
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
          <UserEmail userEmail={props.email} apiUrl={apiUrl} />
          <div className=" mt-5">
            {isShowingPasswordRecovery ?
              <UserPassword userEmail={props.email} handleClose={() => setShowPasswordRecovery(false)} />
              :
              <button onClick={() => setShowPasswordRecovery(true)} className="w-full border border-gray-900 rounded-lg">Reset password</button>
            }
          </div>
          <UserDelete apiUrl={apiUrl} />
        </div>
        :
        <></>}

    </div>

  );
};

export default UserProfileSidebar;
