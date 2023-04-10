import { signOut, useSession } from "next-auth/react";
import Router from "next/router";
import React, { useState } from "react";

interface INewCollectionProps {
    apiUrl: string,
    syllabusUUID: string,
    handleClose: Function,
}

// the new collection component is used in two cases
//- on the user profile, an empty collection can be created
//- on the syllabus page, a collection can be created from the `add to collection` dropdown
//- if `syllabusUUID` is not empty, the UUID is added to the collection after its creation

const NewCollection: React.FunctionComponent<INewCollectionProps> = ({ apiUrl, syllabusUUID, handleClose }) => {
    const [log, setLog] = useState('')
    const [name, setName] = useState('')
    const { data: session } = useSession();      
    
    const handleCloseButton = (e: React.BaseSyntheticEvent) => {
        e.preventDefault()
        handleClose()
    }

    const handleNameChange = (e: React.BaseSyntheticEvent) => {
        e.preventDefault()
        setName(e.target.value)
    }

    const submitCreate = (e: React.BaseSyntheticEvent) => {
        e.preventDefault()

        const h = new Headers();
        h.append("Authorization", `Bearer ${session?.user.token}`);

        let b = new FormData()
        b.append("name", name)

        const url = new URL(`collections/`, apiUrl);

        fetch(url, {
            method: 'POST',
            headers: h,
            body: b,
        })
            .then((res) => {
                if (res.ok) {
                    setLog('')
                    if (syllabusUUID !== '') {
                        console.log('add the syllabus to the newly created collection');
                    } else {
                        Router.reload()
                    }
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
                setLog(`An error occured while creating: ${body}`)
            })
    }

    return (<>
        <div>
            <h4>Create new Collection</h4>
            <form>
                <label htmlFor="name">Name</label>
                <input name="name" type="text" placeholder="Name of your new collection" onChange={handleNameChange}></input>
                <input type="submit" onClick={submitCreate} value="Create Collection"></input>
                <div>{log}</div>
            </form>
            <button onClick={handleCloseButton}>X</button>
        </div>
    </>)
}

export default NewCollection;