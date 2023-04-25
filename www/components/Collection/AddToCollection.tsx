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
import PubBadge from "components/commons/PubBadge";
import Modal from "components/commons/Modal";

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

    const removeSyllabusFromCollection = (coll_uuid: string) => {
        const h = new Headers();
        h.append("Authorization", `Bearer ${session?.user.token}`);

        const url = new URL(`/collections/${coll_uuid}/syllabi/${syllabusInfo.uuid}`, process.env.NEXT_PUBLIC_API_URL)

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

    const addSyllabusToCollection = (coll_uuid: string) => {
        const b = new FormData()
        b.append("syllabus_id", syllabusInfo.uuid as string)

        const h = new Headers();
        h.append("Authorization", `Bearer ${session?.user.token}`);

        const url = new URL(`/collections/${coll_uuid}/syllabi`, process.env.NEXT_PUBLIC_API_URL)
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
            <Modal>
                <h2 className={`text-xl mb-8`}>Add syllabus to one of your collections:</h2>
                <div>
                    <div className="flex flex-col gap-3">
                        <div className="md:w-2/3 flex flex-col justify-start gap-2">
                            {collections.map((c, i) => {
                                return (<div data-cy="user-collection" className="flex gap-2" key={`coll-${i}`}>
                                    <div className="w-full flex flex-col border border-gray-900 rounded-md p-1">
                                        <div className={`${kurintoSerif.className} text-lg`}>{c.name}</div>
                                        <PubBadge isPublic={c.status === "listed"} />
                                    </div>
                                    {checkIfSyllabusInCollection(c, syllabusInfo) ?
                                        <button data-cy="remove-from-collection" onClick={() => { removeSyllabusFromCollection(c.uuid) }} data-collectionid={c.uuid} key={c.uuid} className="flex gap-2 items-center border border-gray-900 rounded-md p-1">
                                            <Image src={removeIcon} width="24" height="24" alt="Icon to remove the syllabus from the collection" />

                                        </button>
                                        :
                                        <button data-cy="add-to-collection" onClick={() => { addSyllabusToCollection(c.uuid) }} data-collectionid={c.uuid} key={c.uuid} className="flex gap-2 items-center border border-gray-900 rounded-md p-1">
                                            <Image src={addIcon} width="24" height="24" alt="Icon to add the syllabus to a collection" />

                                        </button>
                                    }
                                </div>)
                            })}
                        </div>
                    </div>


                    <button aria-label="New Collection" data-cy="new-collection" onClick={() => { setIsCreatingCollection(true) }} className="md:w-max flex mt-8 gap-2 border border-gray-900 rounded-md p-1">
                        <Image src={addCircleIcon} width="24" height="24" alt="Icon to add the syllabus to a collection" />
                        <div>Create new collection</div>
                    </button>
                    <div>{log}</div>
                </div>
                <button onClick={handleCloseButton} data-cy="close-button" className="absolute top-2 right-2">
                    <Image src={cancelIcon} width="24" height="24" alt="Icon to cancel the edit process" />
                </button>
            </Modal>
            {isCreatingCollection ?
                <Modal>
                    <NewCollection syllabusUUID={syllabusInfo.uuid} handleClose={() => setIsCreatingCollection(false)} />
                </Modal>
                :
                <></>
            }
        </div>
    )
}

export default AddToCollection;