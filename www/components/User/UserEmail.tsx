import { signOut, useSession } from "next-auth/react";
import Router from "next/router";
import { useState } from "react";

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
        <h5>Email</h5>
        {isEditing ?
            <div>
                <input type="text" placeholder="Enter your email" onChange={handleChange}></input>
                <input type="text" placeholder="Confirm your email" onChange={handleChangeConf}></input>
                <button onClick={() => { setIsEditing(false); }}>cancel</button>
                <button onClick={submitEdit}>save</button>
                <div>{log}</div>
            </div>
            :
            <>
                <div>{email}</div>
                <button onClick={() => setIsEditing(true)}>edit</button>
            </>
        }
    </div>)
}

export default UserEmail;