import * as React from "react";
import Link from "next/link";
import { IUser } from "types";
import { kurintoBook } from "app/layout";

interface IUserCardProps {
    user: IUser
    isAdmin: boolean | false
}

const UserCard: React.FunctionComponent<IUserCardProps> = (
    { user, isAdmin }
) => {
    return (
        <div data-cy="userCard" className="border-2 border-gray-600 rounded-lg p-3">
            <div className="flex flex-col gap-4">
                <div className={`flex flex-col justify-between w-full my-2`}>
                    <Link href={`/user/${user.uuid}`} className={`${kurintoBook.className} text-2xl font-bold hover:underline`}>
                        {user.name}
                    </Link>
                    {user.institutions?.map((inst, index) => {
                        return(<div className="text-sm" key={`instructor-${index}`}>{inst.name}</div>)
                    })}
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

                <div className="text-md">
                    {user.bio}
                </div>

                <div>
                    {user.name} has uploaded <b>{user.syllabi?.length}</b> syllabi and has created <b>{user.collections?.length}</b> collections.
                </div>
            </div>
        </div>
    );
};

export default UserCard;
