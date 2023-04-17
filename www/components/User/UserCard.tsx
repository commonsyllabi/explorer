import * as React from "react";
import Link from "next/link";
import { IUser } from "types";

interface IUserCardProps {
    user: IUser
    isAdmin: boolean | false
}

const UserCard: React.FunctionComponent<IUserCardProps> = (
    { user, isAdmin }
) => {
    return (
        <div data-cy="syllabusCard" className="border-2 border-gray-600 rounded-lg p-3">
            <div>
                <div className="flex justify-between w-full mt-2 mb-2">
                    <Link href={`/collections/${user.uuid}`} className="text-xl font-bold hover:underline">
                        {user.name}
                    </Link>
                </div>
                {isAdmin ?
                    <div className="text-gray-400 my-4">
                        <div className="text-sm">
                            {user.email}
                        </div>
                        <div className="text-sm">
                            {user.status}
                        </div>
                        <div className="text-sm">
                            {user.uuid}
                        </div>
                    </div>
                    :
                    <></>}

                <div className="text-sm">
                    {user.bio}
                </div>
            </div>
        </div>
    );
};

export default UserCard;
