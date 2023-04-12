import { signOut, useSession } from "next-auth/react";
import Router from "next/router";
import * as React from "react";
import { useState } from "react";

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
        <div className="mt-5 flex flex-column">
            {isEditing ?
                <div>
                    <input type="text" value={tmp} onChange={handleChange}></input>
                    <button onClick={() => { setIsEditing(false); }}>cancel</button>
                    <button onClick={submitEdit}>save</button>
                    <div>{log}</div>
                </div>
                :
                <div>
                    <h2>{name}</h2>
                    {isAdmin ?

                        <button onClick={() => setIsEditing(true)}>edit</button>
                        : <></>}
                </div>
            }
        </div>
    );
};

export default UserName;
