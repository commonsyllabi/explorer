import * as React from "react";

interface IUserBioProps {
  userBio: string | undefined;
}

const UserBio: React.FunctionComponent<IUserBioProps> = ({ userBio }) => {
  if (userBio) {
    if (UserBio.length > 0) {
      return <p className="mt-5">{userBio}</p>;
    }
  }
  return (
    <p className="text-muted mt-5">
      <em>User has not written a bio.</em>
    </p>
  );
};

export default UserBio;
