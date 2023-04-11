import { signOut, useSession } from "next-auth/react";
import Router from "next/router";
import React, { useState } from "react";
import { ICollection, ISyllabus } from "types";
import NewCollection from "./NewCollection";

interface IAddCollectionProps {
    collections: ICollection[],
    syllabusInfo: ISyllabus,
    handleClose: Function
}

const AddToCollection: React.FunctionComponent<IAddCollectionProps> = ({ collections, syllabusInfo, handleClose }) => {

    const { data: session } = useSession()
    const [log, setLog] = useState('')
    const [isCreatingCollection, setIsCreatingCollection] = useState(false)

    const checkIfSyllabusInCollection = (coll: ICollection, syll: ISyllabus) => {
        if (!syll.collections) return false
        for (const c of syll.collections)
            if (c.uuid === coll.uuid) return true

        return false
    }

    const removeSyllabusFromCollection = (e: React.BaseSyntheticEvent) => {
        e.preventDefault()
        const t = e.target

        const h = new Headers();
        h.append("Authorization", `Bearer ${session?.user.token}`);

        const url = new URL(`/collections/${t.dataset.collectionid}/syllabi/${syllabusInfo.uuid}`, process.env.NEXT_PUBLIC_API_URL)

        fetch(url, {
            method: 'DELETE',
            headers: h,
        })
            .then(res => {
                if (res.ok) {
                    setLog('Success!')
                    Router.reload()
                    return
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
                if (body !== '')
                    setLog(`There was an error adding the syllabus to the collection`)
            })
    }

    const addSyllabusToCollection = (e: React.BaseSyntheticEvent) => {
        e.preventDefault()
        const t = e.target

        const b = new FormData()
        b.append("syllabus_id", syllabusInfo.uuid as string)

        const h = new Headers();
        h.append("Authorization", `Bearer ${session?.user.token}`);

        const url = new URL(`/collections/${t.dataset.collectionid}/syllabi`, process.env.NEXT_PUBLIC_API_URL)
        fetch(url, {
            method: 'POST',
            headers: h,
            body: b
        })
            .then(res => {
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
                    return res.text()
                } else {
                    return res.text()
                }
            })
            .then(body => {
                if (body !== '')
                    setLog(`There was an error adding the syllabus to the collection`)
            })

    }
    return (
        <div>
            here is a list of collections from the user
            <div>
                {collections.map(c => {
                    if (checkIfSyllabusInCollection(c, syllabusInfo))
                        return <div key={c.uuid}>
                            <div>{c.name} - {c.status}</div>
                            <button onClick={removeSyllabusFromCollection} data-collectionid={c.uuid}>-</button>

                        </div>
                    else
                        return <div key={c.uuid}>
                            <div>{c.name} - {c.status}</div>
                            <button onClick={addSyllabusToCollection} data-collectionid={c.uuid}>+</button>
                        </div>
                })}
                <button aria-label="New Collection" onClick={() => { setIsCreatingCollection(true) }}>
                    + Add to new Collection
                </button>
                {isCreatingCollection ?
                    <NewCollection syllabusUUID={syllabusInfo.uuid} handleClose={() => setIsCreatingCollection(false)} />
                    :
                    <></>
                }
                <div>{log}</div>
            </div>
            <button onClick={() => handleClose()}>close</button>
        </div>
    )
}

export default AddToCollection;