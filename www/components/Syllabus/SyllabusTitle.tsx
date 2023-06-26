import { signOut, useSession } from "next-auth/react";
import Router from "next/router";
import { useContext, useState } from "react";
import Image from "next/image";
import editIcon from '../../public/icons/edit-line.svg'
import cancelIcon from '../../public/icons/close-line.svg'
import checkIcon from '../../public/icons/check-line.svg'
import { kurintoSerif } from "app/layout";
import { EditContext } from "context/EditContext";
import { getPublicPrivateLabel } from "components/utils/formUtils";

interface ISyllabusTitleProps {
    syllabusTitle: string,
    syllabusStatus: string
}

const SyllabusTitle: React.FunctionComponent<ISyllabusTitleProps> = ({ syllabusTitle, syllabusStatus }) => {
    const ctx = useContext(EditContext)
    const [log, setLog] = useState('')
    const [isEditing, setIsEditing] = useState(false);
    const [isShowingTooltip, setShowTooltip] = useState(false)
    const [title, setTitle] = useState(syllabusTitle ? syllabusTitle as string : '')
    const [tmp, setTmp] = useState(title)
    const [tmpStatus, setTmpStatus] = useState(syllabusStatus)
    const { data: session } = useSession();

    const handleChange = (e: React.BaseSyntheticEvent) => {
        e.preventDefault()
        setTmp(e.target.value)
    }

    const handleStatusChange = (e: React.BaseSyntheticEvent) => {
        const st = tmpStatus === "unlisted" ? "listed" : "unlisted"
        setTmpStatus(st)
    }

    const submitEdit = () => {
        if (tmp.length < 2) {
            setLog("title cannot be empty")
            return
        }

        const h = new Headers();
        h.append("Authorization", `Bearer ${session?.user.token}`);

        let b = new FormData()
        b.append("title", tmp)
        b.append("status", tmpStatus)

        const endpoint = new URL(`/syllabi/${ctx.syllabusUUID}`, process.env.NEXT_PUBLIC_API_URL)
        fetch(endpoint, {
            method: 'PATCH',
            headers: h,
            body: b
        })
            .then((res) => {
                if (res.ok) {
                    setIsEditing(false)
                    setTitle(tmp)
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
                if(body)
                    setLog(`An error occured while saving: ${body}`)
            })
    }

    return (
        <div className="md:w-1/2 my-5 flex flex-col">
            {isEditing ?
                <div className="flex flex-col justify-between">
                    <input type="text" className={`${kurintoSerif.className} text-3xl p-0 m-0 w-full bg-transparent pb-1 border-b-2 border-b-gray-900`} value={tmp} onChange={handleChange} data-cy="edit-course-title"/>
                    <div className="py-1 mt-2 flex flex-col md:flex-row gap-2 justify-between">
                        <button className="flex items-center gap-2 rounded-lg border border-1 border-gray-900 py-1 px-2 bg-red-100 hover:bg-red-300" onClick={() => { setIsEditing(false); }}>
                            <Image src={cancelIcon} width="24" height="24" alt="Icon to cancel the edit process" />
                            <div>Cancel</div>
                        </button>
                        <button className="flex items-center gap-2 rounded-lg border border-1 border-gray-900 py-1 px-2" onClick={submitEdit} data-cy="save-button">
                            <Image src={checkIcon} width="24" height="24" alt="Icon to save the edit process" />
                            <div>Save</div>
                        </button>
                    </div>

                    <div className="flex items-center gap-3">
                        <label htmlFor="status" className="order-2" data-cy="collection-status-label">
                            {getPublicPrivateLabel(tmpStatus)}
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
                    <div>{log}</div>
                </div>
                :
                <div className="flex flex-col gap-2" data-cy="course-title">
                    <h1 className={`${kurintoSerif.className} text-3xl p-0 m-0`}>{title}</h1>
                    {ctx.isOwner && !isEditing ?
                        <button className={`flex gap-2 opacity-70 border ${isShowingTooltip ? '' : 'opacity-40'} rounded-md border-gray-700 w-max p-1`} onClick={() => setIsEditing(true)} onMouseEnter={() => { setShowTooltip(true) }} onMouseLeave={() => { setShowTooltip(false) }}>
                            <Image src={editIcon} width="22" height="22" alt="Icon to edit the list" />
                            <div className={`${isShowingTooltip ? '' : 'hidden'} text-sm`}>Edit</div>
                        </button>
                        : <></>}
                </div>
            }
        </div>
    );
};

export default SyllabusTitle;
