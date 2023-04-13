import { signOut, useSession } from "next-auth/react";
import Router from "next/router";
import React, { useState } from "react";
import { ICollection, ISyllabus } from "types";
import NewCollection from "./NewCollection";
import Image from "next/image";
import cancelIcon from '../../public/icons/close-line.svg'
import addIcon from '../../public/icons/add-line.svg'
import addCircleIcon from '../../public/icons/add-circle-line.svg'
import removeIcon from '../../public/icons/subtract-line.svg'
import { kurintoSerif } from "app/layout";
import PubBadge from "components/PubBadge";

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

    const handleCloseButton = (e: React.BaseSyntheticEvent) => {
        e.preventDefault()
        handleClose()
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
        <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center bg-gray-50/80">
            <div className="relative md:w-6/12 m-2 bg-gray-50 border-2 border-gray-900 rounded-lg p-8">
                <h2 className={`text-xl mb-8`}>Add syllabus to one of your collections:</h2>
                <div>
                    <div className="flex flex-col gap-3">
                        {collections.map(c => {
                            if (checkIfSyllabusInCollection(c, syllabusInfo))
                                return <button onClick={removeSyllabusFromCollection} data-collectionid={c.uuid} key={c.uuid} className="flex gap-2">
                                    <Image src={removeIcon} width="24" height="24" alt="Icon to remove the syllabus from the collection" />
                                    <div><span className={`${kurintoSerif.className} text-lg`}>{c.name}</span> - <PubBadge isPublic={c.status === "listed"} /></div>
                                </button>
                            else
                                return <button onClick={addSyllabusToCollection} data-collectionid={c.uuid} key={c.uuid} className="flex gap-2">
                                    <Image src={addIcon} width="24" height="24" alt="Icon to add the syllabus to a collection" />
                                    <div><span className={`${kurintoSerif.className} text-lg`}>{c.name}</span>  - <PubBadge isPublic={c.status === "listed"} /></div>
                                </button>
                        })}
                    </div>


                    <button aria-label="New Collection" onClick={() => { setIsCreatingCollection(true) }} className="flex mt-8 gap-2 border border-gray-900 rounded-md p-1">
                        <Image src={addCircleIcon} width="24" height="24" alt="Icon to add the syllabus to a collection" />
                        <div>Add to new collection</div>
                    </button>
                    <div>{log}</div>
                </div>
                <button onClick={handleCloseButton} className="absolute top-2 right-2">
                    <Image src={cancelIcon} width="24" height="24" alt="Icon to cancel the edit process" />
                </button>
            </div>
            {isCreatingCollection ?
                <NewCollection syllabusUUID={syllabusInfo.uuid} handleClose={() => setIsCreatingCollection(false)} />
                :
                <></>
            }
        </div>
    )
}

export default AddToCollection;