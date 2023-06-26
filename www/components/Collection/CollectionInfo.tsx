import { EditContext } from "context/EditContext";
import { signOut, useSession } from "next-auth/react";
import Router from "next/router";
import { useContext, useEffect, useState } from "react";
import { ICollection } from "types";
import Image from "next/image";

import { kurintoBook } from "app/layout";
import editIcon from '../../public/icons/edit-line.svg'
import cancelIcon from '../../public/icons/close-line.svg'
import checkIcon from '../../public/icons/check-line.svg'
import { getPublicPrivateLabel } from "components/utils/formUtils";
import PubBadge from "components/commons/PubBadge";
import { getIsPublic } from "components/utils/getIsPublic";

interface ICollectionInfoProps {
    collectionInfo: ICollection;
}

const CollectionInfo: React.FunctionComponent<ICollectionInfoProps> = ({
    collectionInfo,
}) => {
    const ctx = useContext(EditContext)
    const { data: session } = useSession();
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState('')
    const [status, setStatus] = useState('')
    const [description, setDescription] = useState('')
    const [tmpName, setTmpName] = useState('')
    const [tmpStatus, setTmpStatus] = useState('')
    const [tmpDescription, setTmpDescription] = useState('')
    const [log, setLog] = useState('')
    const [isShowingTooltip, setShowTooltip] = useState(false)

    useEffect(() => {
        if (!collectionInfo) return
        setName(collectionInfo.name)
        setTmpName(collectionInfo.name)
        setDescription(collectionInfo.description)
        setTmpDescription(collectionInfo.description)
        setStatus(collectionInfo.status)
        setTmpStatus(collectionInfo.status)

    }, [collectionInfo])

    const handleNameChange = (e: React.BaseSyntheticEvent) => {
        e.preventDefault()
        setTmpName(e.target.value)
    }

    const handleStatusChange = (e: React.BaseSyntheticEvent) => {
        const st = status === "unlisted" ? "listed" : "unlisted"
        setTmpStatus(st)
    }

    const handleDescriptionChange = (e: React.BaseSyntheticEvent) => {
        e.preventDefault()
        setTmpDescription(e.target.value)
    }

    const submitEdit = () => {
        if (!collectionInfo.uuid) return;

        const h = new Headers();
        h.append("Authorization", `Bearer ${session?.user.token}`);

        let b = new FormData()
        if (tmpName.length < 1) {
            setLog("Name must be at least 1 character long")
            return;
        }
        b.append("name", tmpName)
        b.append("description", tmpDescription)
        b.append("status", tmpStatus)

        const endpoint = new URL(`/collections/${collectionInfo.uuid}`, process.env.NEXT_PUBLIC_API_URL)
        fetch(endpoint, {
            method: 'PATCH',
            headers: h,
            body: b
        })
            .then((res) => {
                if (res.ok) {
                    setIsEditing(false)
                    setName(tmpName)
                    setDescription(tmpDescription)
                    setStatus(tmpStatus)
                    setLog('')
                    return;
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

    return (<>
        <div className="flex flex-col gap-2 my-6">
            {isEditing ?
                <div className="w-full md:w-2/3 flex flex-col gap-4">
                    <input data-cy="edit-collection-name" type="text" value={tmpName} defaultValue={name} onChange={handleNameChange} className={`${kurintoBook.className} w-full text-2xl bg-transparent mt-2 py-1 border-b-2 border-b-gray-900`}></input>

                    <div className="flex items-center gap-3">
                        <label htmlFor="status" className="order-2" data-cy="collection-status-label">
                            {getPublicPrivateLabel(status)}
                        </label>
                        <div className="relative border-2 w-6 h-6 border-gray-900 p-0.5 order-1 rounded-full" key="collection-status">
                            <input
                                type="checkbox"
                                role="switch"
                                className="absolute w-4 h-4 appearance-none bg-gray-300 checked:bg-gray-900 cursor-pointer rounded-full"
                                onChange={handleStatusChange}
                                name="status"
                                id="status"
                                value={tmpStatus}
                                defaultValue={status}
                                data-cy="collection-status-input" />
                        </div>
                    </div>

                    <textarea data-cy="edit-collection-description" value={tmpDescription} defaultValue={description} placeholder="Description of what this collection is about." className={`w-full text bg-transparent mt-2 py-1 border border-gray-900`} rows={6} onChange={handleDescriptionChange} />

                    <div className="py-1 mt-2 flex flex-col lg:flex-row gap-2 justify-between">
                        <button data-cy="cancel-button" className="flex items-center gap-2 rounded-lg border border-1 border-gray-900 py-1 px-2 bg-red-100 hover:bg-red-300" onClick={() => { setIsEditing(false); }}>
                            <Image src={cancelIcon} width="24" height="24" alt="Icon to cancel the edit process" />
                            <div>Cancel</div>
                        </button>
                        <button data-cy="save-button" className="flex items-center gap-2 rounded-lg border border-1 border-gray-900 py-1 px-2" onClick={submitEdit}>
                            <Image src={checkIcon} width="24" height="24" alt="Icon to save the edit process" />
                            <div>Save</div>
                        </button>
                    </div>
                    <div>{log}</div>
                </div>
                : ctx.isOwner ?
                    <>
                        <h1 data-cy="collection-name" className={`${kurintoBook.className} text-3xl`}>{name}</h1>
                        <div data-cy="collection-description" className="">{description}</div>
                        <div className="flex gap-3">
                        <PubBadge isPublic={getIsPublic(status)} />
                            <button className={`flex gap-2 opacity-70 border ${isShowingTooltip ? '' : 'opacity-40'} rounded-md border-gray-700 w-max p-1`} onClick={() => setIsEditing(true)} data-cy="edit-button" onMouseEnter={() => { setShowTooltip(true) }} onMouseLeave={() => { setShowTooltip(false) }}>
                                <Image src={editIcon} width="22" height="22" alt="Icon to edit the list" />
                                <div className={`${isShowingTooltip ? '' : 'hidden'} text-sm`}>Edit</div>
                            </button>
                        </div>
                    </>

                    :
                    <>
                        <h1 className={`${kurintoBook.className} text-3xl`}>{collectionInfo.name}</h1>
                        
                        <div data-cy="collection-description" className="">{description}</div>
                    </>
            }

        </div>
    </>)
}

export default CollectionInfo;