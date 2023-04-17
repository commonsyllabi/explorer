import UserCard from "components/User/UserCard";
import { IUser } from "types";

export const getUserCards = (
  users: IUser[] | undefined,
  isAdmin: boolean
) => {
  if (!users || users.length === 0) {
    return null;
  }

  const usersCards = users.map((u) => (
    <UserCard key={u.uuid} user={u} isAdmin={isAdmin}
    />
  ));

  return <>{usersCards}</>;
};
