import { EditContext } from "context/EditContext";
import { signOut, useSession } from "next-auth/react";
import Router from "next/router";
import { useContext, useState } from "react";

const UserDelete: React.FunctionComponent = () => {
    const ctx = useContext(EditContext)
    const [log, setLog] = useState('')
    const { data: session } = useSession();
    const confirmMsg = "Do you really want to delete your account, all your syllabi and collections? This action cannot be undone.";


    const submitDelete = async () => {
        if (!ctx.userUUID || !window.confirm(confirmMsg))
            return

        const h = new Headers();
        h.append("Authorization", `Bearer ${session?.user.token}`);

        const endpoint = new URL(`/users/${ctx.userUUID}`, process.env.NEXT_PUBLIC_API_URL)
        const res = await fetch(endpoint, {
            method: 'DELETE',
            headers: h,
        })

        if (res.ok) {
            signOut({ redirect: false }).then((result) => {
                Router.push("/");
            })
            return;
        } else if (res.status == 401) {
            signOut({ redirect: false }).then((result) => {
                Router.push("/auth/signin");
            })
            return;
        } else {
            const body = await res.text()
            setLog(`An error occured while deleting: ${body}`)
        }
    }
    return (<>
        <button data-cy="delete-user" className="w-full bg-red-400 hover:bg-red-500 text-white rounded-lg my-5 p-1" onClick={submitDelete}>Delete Account</button>
        <div>{log}</div>
    </>)
}

export default UserDelete;