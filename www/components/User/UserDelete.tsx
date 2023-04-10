import { signOut, useSession } from "next-auth/react";
import Router from "next/router";
import { useState } from "react";

interface IUserDeleteProps {
    apiUrl: string,
}

const UserDelete: React.FunctionComponent<IUserDeleteProps> = ({ apiUrl }) => {
    const [log, setLog] = useState('')
    const { data: session } = useSession();
    const confirmMsg = "Do you really want to delete your account, all your syllabi and collections? This action cannot be undone.";


    const submitDelete = () => {
        if (!window.confirm(confirmMsg))
            return

        const h = new Headers();
        h.append("Authorization", `Bearer ${session?.user.token}`);

        fetch(apiUrl, {
            method: 'DELETE',
            headers: h,
        })
            .then((res) => {
                if (res.ok) {
                    signOut({ redirect: false }).then((result) => {
                        Router.push("/");
                    })
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
                setLog(`An error occured while deleting: ${body}`)
            })
    }
    return (<>
        <button onClick={submitDelete}>Delete Account</button>
        <div>{log}</div>
    </>)
}

export default UserDelete;