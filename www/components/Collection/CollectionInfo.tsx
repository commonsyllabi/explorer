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

interface ICollectionInfoProps {
    collectionInfo: ICollection;
}

const CollectionInfo: React.FunctionComponent<ICollectionInfoProps> = ({
    collectionInfo,
}) => {
    const ctx = useContext(EditContext)
    const { data: session, status } = useSession();
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState('')
    const [tmp, setTmp] = useState('')
    const [log, setLog] = useState('')
    const [isShowingTooltip, setShowTooltip] = useState(false)

    useEffect(() => {
        if (!collectionInfo) return
        setName(collectionInfo.name)
        setTmp(collectionInfo.name)

    }, [collectionInfo])

    const handleChange = (e: React.BaseSyntheticEvent) => {
        e.preventDefault()
        setTmp(e.target.value)
    }

    const submitEdit = () => {
        if (!collectionInfo.uuid) return;

        const h = new Headers();
        h.append("Authorization", `Bearer ${session?.user.token}`);

        let b = new FormData()
        if (tmp.length < 1) {
            setLog("Name must be at least 1 character long")
            return;
        }
        b.append("name", tmp)

        const endpoint = new URL(`/collections/${collectionInfo.uuid}`, process.env.NEXT_PUBLIC_API_URL)
        fetch(endpoint, {
            method: 'PATCH',
            headers: h,
            body: b
        })
            .then((res) => {
                if (res.ok) {
                    setIsEditing(false)
                    setName(tmp)
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
                <div className="w-full md:w-2/3">
                    <input data-cy="edit-collection-name" value={tmp} defaultValue={name} onChange={handleChange} className={`${kurintoBook.className} w-full text-2xl bg-transparent mt-2 py-1 border-b-2 border-b-gray-900`}></input>
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
                        <div className="flex gap-3">
                            <button className={`flex gap-2 opacity-70 border ${isShowingTooltip ? '' : 'opacity-40'} rounded-md border-gray-700 w-max p-1`} onClick={() => setIsEditing(true)} data-cy="edit-button" onMouseEnter={() => { setShowTooltip(true) }} onMouseLeave={() => { setShowTooltip(false) }}>
                                <Image src={editIcon} width="22" height="22" alt="Icon to edit the list" />
                                <div className={`${isShowingTooltip ? '' : 'hidden'} text-sm`}>Edit</div>
                            </button>
                        </div>
                    </>

                    :
                    <h1 className={`${kurintoBook.className} text-3xl`}>{collectionInfo.name}</h1>
            }

        </div>
    </>)
}

export default CollectionInfo;