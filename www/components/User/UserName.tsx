import { signOut, useSession } from "next-auth/react";
import Router from "next/router";
import * as React from "react";
import { useState } from "react";
import Image from "next/image";
import editIcon from '../../public/icons/edit-box-line.svg'
import cancelIcon from '../../public/icons/close-line.svg'
import checkIcon from '../../public/icons/check-line.svg'
import { kurintoSerif } from "app/layout";

interface IUserNameProps {
    userName: string,
    isAdmin: boolean,
    apiUrl: string,
}

const UserName: React.FunctionComponent<IUserNameProps> = ({ userName, isAdmin, apiUrl }) => {

    const [log, setLog] = useState('')
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(userName ? userName as string : '')
    const [tmp, setTmp] = useState(name)
    const { data: session } = useSession();

    const handleChange = (e: React.BaseSyntheticEvent) => {
        e.preventDefault()
        setTmp(e.target.value)
    }

    const submitEdit = () => {
        if (tmp.length < 2) {
            setLog("name cannot be empty")
            return
        }

        const h = new Headers();
        h.append("Authorization", `Bearer ${session?.user.token}`);

        let b = new FormData()
        b.append("name", tmp)

        fetch(apiUrl, {
            method: 'PATCH',
            headers: h,
            body: b
        })
            .then((res) => {
                if (res.ok) {
                    setIsEditing(false)
                    setName(tmp)
                    setLog('')
                } else if (res.status == 401) {
                    signOut({ redirect: false }).then((result) => {
                        Router.push("/auth/signin");
                    })
                    return res.text()
                } else {
                    return res.text()
                }
            })
            .then(body => {
                setLog(`An error occured while saving: ${body}`)
            })
    }

    return (
        <div className="mt-5 mb-16 flex flex-col">
            {isEditing ?
                <div className="flex items-center justify-between">
                    <input type="text" className="text-2xl w-8/12 bg-transparent mt-2 py-1 border-b-2 border-b-gray-900" value={tmp} onChange={handleChange}></input>
                    <div className="py-1 mt-2">
                        <button className="w-6" onClick={() => { setIsEditing(false); }}>
                            <Image src={cancelIcon} width="24" height="24" alt="Icon to cancel the edit process" />
                        </button>
                        <button className="w-6" onClick={submitEdit}>
                            <Image src={checkIcon} width="24" height="24" alt="Icon to save the edit process" />
                        </button>
                    </div>
                    <div>{log}</div>
                </div>
                :
                <div className="flex justify-between">
                    <h2 className={`${kurintoSerif.className} text-3xl`}>{name}</h2>
                    {isAdmin ?
                        <button className="ml-8" onClick={() => setIsEditing(true)}>
                            <Image src={editIcon} width="24" height="24" alt="Icon to edit the name" />
                        </button>
                        : <></>}
                </div>
            }
        </div>
    );
};

export default UserName;
