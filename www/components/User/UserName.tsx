import { signOut, useSession } from "next-auth/react";
import Router from "next/router";
import * as React from "react";
import { useContext, useState } from "react";
import Image from "next/image";
import editIcon from '../../public/icons/edit-line.svg'
import cancelIcon from '../../public/icons/close-line.svg'
import checkIcon from '../../public/icons/check-line.svg'
import { kurintoSerif } from "app/layout";
import { EditContext } from "context/EditContext";

interface IUserNameProps {
    userName: string,
    apiUrl: string,
}

const UserName: React.FunctionComponent<IUserNameProps> = ({ userName, apiUrl }) => {
    const ctx = useContext(EditContext)
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
        <div className="w-full mt-5 mb-16 flex flex-col">
            {isEditing ?
                <div className="w-full flex flex-col justify-between">
                    <input type="text" className={`${kurintoSerif.className} text-3xl w-full bg-transparent mt-2 py-1 border-b-2 border-b-gray-900`} value={tmp} onChange={handleChange}></input>
                    <div className="py-1 mt-2 flex flex-col lg:flex-row gap-2 justify-between">
                        <button className="flex items-center gap-2 rounded-lg border border-1 border-gray-900 py-1 px-2 bg-red-100 hover:bg-red-300" onClick={() => { setIsEditing(false); }}>
                            <Image src={cancelIcon} width="24" height="24" alt="Icon to cancel the edit process" />
                            <div>Cancel</div>
                        </button>
                        <button className="flex items-center gap-2 rounded-lg border border-1 border-gray-900 py-1 px-2" onClick={submitEdit}>
                            <Image src={checkIcon} width="24" height="24" alt="Icon to save the edit process" />
                            <div>Save</div>
                        </button>
                    </div>
                    <div>{log}</div>
                </div>
                :
                <div className="flex justify-between">
                    <h2 className={`${kurintoSerif.className} text-3xl`}>{name}</h2>
                    {ctx.isOwner ?
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
