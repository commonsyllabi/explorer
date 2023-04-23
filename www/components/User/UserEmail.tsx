import { signOut, useSession } from "next-auth/react";
import Router from "next/router";
import { useState } from "react";
import Image from "next/image";
import editIcon from '../../public/icons/edit-line.svg'
import cancelIcon from '../../public/icons/close-line.svg'
import checkIcon from '../../public/icons/check-line.svg'

interface IUserEmailProps {
    userEmail: string
    apiUrl: string,
}

const UserEmail: React.FunctionComponent<IUserEmailProps> = ({ userEmail, apiUrl }) => {
    const [log, setLog] = useState('')
    const [isEditing, setIsEditing] = useState(false);
    const [email, setEmail] = useState(userEmail)
    const [tmp, setTmp] = useState('')
    const [tmpConf, setTmpConf] = useState('')
    const { data: session } = useSession();

    const validateEmail = (_e: string) => {
        return String(_e)
            .toLowerCase()
            .match(
                /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
            );
    };

    const submitEdit = () => {
        const h = new Headers();
        h.append("Authorization", `Bearer ${session?.user.token}`);

        //-- check for validity
        if (!validateEmail(tmp)) {
            setLog("The email does not seem to be valid!")
            return
        } else if (tmp !== tmpConf) {
            setLog("Emails must match!")
            return
        }

        let b = new FormData()
        b.append("email", tmp)

        fetch(apiUrl, {
            method: 'PATCH',
            headers: h,
            body: b
        })
            .then((res) => {
                if (res.ok) {
                    setIsEditing(false)
                    setEmail(tmp)
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

    const handleChange = (e: React.BaseSyntheticEvent) => {
        e.preventDefault()
        setTmp(e.target.value)
    }

    const handleChangeConf = (e: React.BaseSyntheticEvent) => {
        e.preventDefault()
        setTmpConf(e.target.value)
    }

    return (<div id="user-email">
        <div className="flex justify-between">

            <h3 className="text-lg">Email</h3>
            {!isEditing ?
                <button className="ml-8" onClick={() => setIsEditing(true)}>
                    <Image src={editIcon} width="18" height="18" alt="Icon to edit the name" />
                </button>
                : <></>}
        </div>
        {isEditing ?
            <div>
                <input type="text" placeholder="Enter your new email" className="w-11/12 bg-transparent mt-2 py-1 border-b-2 border-b-gray-900" onChange={handleChange}></input>
                <input type="text" placeholder="Confirm your new email" className="w-11/12 bg-transparent mt-2 py-1 border-b-2 border-b-gray-900" onChange={handleChangeConf}></input>
                <div className="py-1 mt-4 flex flex-col lg:flex-row gap-2 justify-between">
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
                <div className="underline">{email}</div>

            </div>
        }
    </div>)
}

export default UserEmail;