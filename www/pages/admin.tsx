import * as React from "react";

import type { GetServerSideProps, GetServerSidePropsContext, NextPage } from "next";

import { ICollection, ISyllabiFilters, ISyllabus, IUser } from "types";
import { kurintoSerif } from "app/layout";
import { userInfo } from "os";
import { getSyllabusCards } from "components/utils/getSyllabusCards";
import { getCollectionCards } from "components/utils/getCollectionCards";
import { getUserCards } from "components/utils/getUserCards";
import { useState } from "react";

interface IAdminPanelProps {
    collections: ICollection[],
    syllabi: ISyllabus[],
    users: IUser[],
}

export const getServerSideProps: GetServerSideProps = async (context: GetServerSidePropsContext) => {
    const adminId = context.query.token
    if (adminId !== process.env.ADMIN_KEY)
        return { props: {} }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    const url = new URL(`admin?token=${adminId}`, apiUrl);

    const h = new Headers();
    if (adminId)
        h.append("Authorization", `Bearer ${adminId}`);

    const res = await fetch(url, { headers: h });
    if (res.ok) {
        const info = await res.json();

        return {
            props: {
                collections: info.collections,
                syllabi: info.syllabi,
                users: info.users,
            }
        };
    } else {
        return {
            props: {},
        };
    }

};

const AdminPanel: React.FunctionComponent<IAdminPanelProps> = ({
    collections, syllabi, users
}) => {
    const [showUsers, setShowUsers] = useState(false);
    const [showSyllabi, setShowSyllabi] = useState(false);
    const [showCollections, setShowCollections] = useState(false);

    return (
        <div className="w-11/12 md:w-10/12 m-auto mt-5">
            <h1 className={`${kurintoSerif.className} text-3xl p-0 my-8`}>Admin Panel</h1>
            <div className="flex flex-col gap-3">
                <div>
                    <h1 className={`${kurintoSerif.className} text-2xl p-0 my-4 hover:underline cursor-pointer`} onClick={() => setShowUsers(!showUsers)}>Users ({users.length})</h1>
                    <div className="flex flex-col gap-3">
                        {showUsers ? getUserCards(users, true) : <></>}
                    </div>
                </div>
                <div>
                    <h1 className={`${kurintoSerif.className} text-2xl p-0 my-4 hover:underline cursor-pointer`} onClick={() => setShowSyllabi(!showSyllabi)}>Syllabi ({syllabi.length})</h1>
                    <div className="flex flex-col gap-3">
                        {showSyllabi ? getSyllabusCards(syllabi, undefined, 1) : <></>}
                    </div>
                </div>
                <div>
                    <h1 className={`${kurintoSerif.className} text-2xl p-0 my-4 hover:underline cursor-pointer`} onClick={() => setShowCollections(!showCollections)}>Collections ({collections.length})</h1>
                    <div className="flex flex-col gap-3">
                        {showCollections ? getCollectionCards(collections) : <></>}
                        
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminPanel;
