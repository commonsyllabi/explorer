import { signOut, useSession } from "next-auth/react";
import Router from "next/router";
import React, { useState } from "react";
import { ICollection } from "types";
import Image from "next/image";
import cancelIcon from '../../public/icons/close-line.svg'

interface INewCollectionProps {
    syllabusUUID: string,
    handleClose: Function,
}

const NewCollection: React.FunctionComponent<INewCollectionProps> = ({ syllabusUUID, handleClose }) => {
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

    const addSyllabusToCollection = async (coll_uuid: string, syll_uuid: string) => {
        const b = new FormData()
        b.append("syllabus_id", syll_uuid)

        const h = new Headers();
        h.append("Authorization", `Bearer ${session?.user.token}`);

        const url = new URL(`/collections/${coll_uuid}/syllabi`, process.env.NEXT_PUBLIC_API_URL)
        const res = await fetch(url, {
            method: 'POST',
            headers: h,
            body: b
        })

        if (res.ok) {
            setLog('Success!')
            setTimeout(() => {
                setLog('')
            }, 2000)
            return
        } else if (res.status == 401) {
            signOut({ redirect: false }).then((result) => {
                Router.push("/auth/signin");
            })
        } else {
            const body = await res.text()
            setLog(`There was an error adding the syllabus to the collection: ${body}`)
        }

    }

    const submitCreate = async (e: React.BaseSyntheticEvent) => {
        e.preventDefault()

        const h = new Headers();
        h.append("Authorization", `Bearer ${session?.user.token}`);

        let b = new FormData()
        b.append("name", name)

        const url = new URL(`collections/`, process.env.NEXT_PUBLIC_API_URL);
        const res = await fetch(url, {
            method: 'POST',
            headers: h,
            body: b,
        })

        if (res.ok) {
            setLog('')
            if (syllabusUUID !== '') {
                const data = await res.json()
                addSyllabusToCollection(data.uuid, syllabusUUID)
            } else {
                Router.reload()
                return;
            }
        } else if (res.status == 401) {
            signOut({ redirect: false }).then((result) => {
                Router.push("/auth/signin");
            })
        } else {
            const body = await res.text()
            setLog(`An error occured while creating: ${body}`)
        }
    }

    return (
        <>
            <h1 className="text-xl mb-8">Create new collection</h1>
            <form className="flex flex-col">
                <label htmlFor="name">Name</label>
                <input name="name" data-cy="new-collection-name" type="text" placeholder="Name of your new collection" onChange={handleNameChange} className="bg-transparent mt-2 py-1 border-b-2 border-b-gray-900"></input>
                <input type="submit" data-cy="create-new-collection" onClick={submitCreate} value="Create Collection" className="mt-8 p-2 bg-gray-900 text-gray-100 border-2 rounded-md"></input>
                <div>{log}</div>
            </form>
            <button onClick={handleCloseButton} className="absolute top-2 right-2">
                <Image src={cancelIcon} width="24" height="24" alt="Icon to cancel the edit process" /></button>
        </>)
}

export default NewCollection;