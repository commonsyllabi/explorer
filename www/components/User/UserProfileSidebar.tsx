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
  isAdmin: boolean;
}

const UserProfileSidebar: React.FunctionComponent<IUserProfileSidebarProps> = ({
  props,
  isAdmin,
}) => {
  return (
    <Col lg="4">
      <div id="user-profile" className="py-4">
        <div id="user-description" className="border-bottom pb-4">
          <h2>{props.name}</h2>
          <p className="text-muted small">UUID: {props.uuid}</p>
          <UserBio userBio={props.bio} />
          <UserLinks links={props.urls} />
        </div>

        <div id="user-teaches-at" className="py-4 border-bottom">
          <h3 className="h6">Teaches At</h3>
          <UserInstitutions
            institutions={getinstitutionNames(props.institutions)}
          />
        </div>
        <div id="user-education" className="py-4 border-bottom">
          <h3 className="h6">Education</h3>
          <UserInstitutions institutions={props.education} />
        </div>
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
