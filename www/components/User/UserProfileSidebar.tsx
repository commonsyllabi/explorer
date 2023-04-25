import * as React from "react";

import UserLinks from "components/User/UserLinks";
import UserInstitutions from "components/User/UserInstitutions";

import { IUser } from "types";
import UserBio from "./UserBio";
import UserEducation from "./UserEducation";
import UserEmail from "./UserEmail";
import UserName from "./UserName";
import UserPassword from "./UserPassword";
import UserDelete from "./UserDelete";
import { useContext, useState } from "react";
import { EditContext } from "context/EditContext";

interface IUserProfileSidebarProps {
  userInfo: IUser;
}

const UserProfileSidebar: React.FunctionComponent<IUserProfileSidebarProps> = ({
  userInfo,
}) => {
  const ctx = useContext(EditContext)
  const [isShowingPasswordRecovery, setShowPasswordRecovery] = useState(false)
  return (

    <div id="user-profile" className="">
      <div id="user-description" className="pb-4">
        <UserName userName={userInfo.name} />
        <UserBio userBio={userInfo.bio} />
        <UserLinks userLinks={userInfo.urls as Array<string>} />
      </div>
      <UserInstitutions
        userInstitutions={userInfo.institutions}
      />
      <UserEducation userEducation={userInfo.education as Array<string>} />

      {ctx.isOwner ?
        <div>
          <UserEmail userEmail={userInfo.email} />
          <div className=" mt-5">
            {isShowingPasswordRecovery ?
              <UserPassword userEmail={userInfo.email} handleClose={() => setShowPasswordRecovery(false)} />
              :
              <button onClick={() => setShowPasswordRecovery(true)} className="w-full border border-gray-900 rounded-lg">Reset password</button>
            }
          </div>
          <UserDelete />
        </div>
        :
        <></>}

    </div>

  );
};

export default UserProfileSidebar;
