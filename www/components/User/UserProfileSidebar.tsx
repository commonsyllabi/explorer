import * as React from "react";

import UserLinks from "components/User/UserLinks";
import UserInstitutions from "components/User/UserInstitutions";
import UserListingsSection from "components/User/UserListingsSection";

import Col from "react-bootstrap/Col";

import { IUser, ICollection, IInstitution, ISyllabus } from "types";
import UserBio from "./UserBio";

import {
  getPrivateCollectionList,
  getPublicCollectionList,
} from "components/utils/getUserCollectionsList";

import {
  getPrivateSyllabiList,
  getPublicSyllabiList,
} from "components/utils/getUserSyllabiList";
import UserEducation from "./UserEducation";

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
    <Col lg="4">
      <div id="user-profile" className="py-4">
        <div id="user-description" className="pb-4">
          <h2>{props.name}</h2>
          <UserBio userBio={props.bio} isAdmin={isAdmin} apiUrl={apiUrl} />
          <UserLinks userLinks={props.urls as Array<string>} isAdmin={isAdmin} apiUrl={apiUrl} />
        </div>
        <UserInstitutions
          institutions={getinstitutionNames(props.institutions)}
          isAdmin={isAdmin} apiUrl={apiUrl}
        />
        <UserEducation userEducation={props.education as Array<string>} isAdmin={isAdmin} apiUrl={apiUrl}/>
      </div>
      <UserListingsSection
        isAdmin={isAdmin}
        sectionTitle="Syllabi"
        sectionContents={getPublicSyllabiList(props.syllabi)}
        sectionPrivateContents={getPrivateSyllabiList(props.syllabi)}
      />
      <UserListingsSection
        isAdmin={isAdmin}
        sectionTitle="Collections"
        sectionContents={getPublicCollectionList(props.collections)}
        sectionPrivateContents={getPrivateCollectionList(props.collections)}
      />
    </Col>
  );
};

export default UserProfileSidebar;
