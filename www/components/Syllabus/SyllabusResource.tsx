import AttachmentItemEditable from "components/NewSyllabus/AttachmentItemEditable";
import { useContext, useState } from "react";
import { IAttachment } from "types";
import SyllabusAttachment from "./SyllabusAttachment";
import Image from "next/image";
import editIcon from '../../public/icons/edit-line.svg'
import moreIcon from '../../public/icons/more-2-fill.svg'
import cancelIcon from '../../public/icons/close-line.svg'
import deleteIcon from '../../public/icons/delete-bin-line.svg'
import { EditContext } from "context/EditContext";
import { signOut, useSession } from "next-auth/react";
import Router from "next/router";

interface ISyllabusResourceProps {
    att: IAttachment,
    onDelete: Function,
    onEdit: Function,
}

const SyllabusResource: React.FunctionComponent<ISyllabusResourceProps> = ({ att, onDelete, onEdit }) => {
    const ctx = useContext(EditContext)
    const [isEditing, setIsEditing] = useState(false);
    const [log, setLog] = useState("")
    const { data: session } = useSession()
    const [isShowingMore, setIsShowingMore] = useState(false)
    const confirmMsg = `Do you really want to delete the attachment ${att.name}? This action cannot be undone.`;


    const deleteAttachment = async (e: React.SyntheticEvent) => {
        e.preventDefault()
        e.stopPropagation()

        if (!window.confirm(confirmMsg))
            return

        const h = new Headers();
        h.append("Authorization", `Bearer ${session?.user.token}`);

        const endpoint = new URL(`attachments/${att.uuid}`, process.env.NEXT_PUBLIC_API_URL)
        const res = await fetch(endpoint, {
            method: 'DELETE',
            headers: h,
        })

        if (res.ok) {
            setLog("Successfully deleted attachment!")

            onDelete(att.uuid)
        } else if (res.status == 401) {
            signOut({ redirect: false }).then((result) => {
                Router.push("/auth/signin");
            })
            return res.text()
        } else {
            return res.text()
        }

        const body = res.text()
        setLog(`An error occured while deleting: ${body}`)
    };

    return (<>
        {!isEditing ?
            <div className="flex items-stretch gap-2 mb-2">
                <SyllabusAttachment
                    resourceTitle={att.name}
                    resourceUrl={att.url ? att.url : ""}
                    resourceDescription={att.description ? att.description : ""}
                    resourceType={att.type}
                    key={att.uuid}
                />
                {ctx.isOwner && !isShowingMore ?
                    <button className="flex items-center justify-center gap-2 border rounded-md border-gray-700 p-1" onClick={() => setIsShowingMore(true)}>
                        <Image src={moreIcon} width="24" height="24" alt="Icon to show more options" />
                    </button> : <div className="flex flex-col gap-1 items-stretch">
                        <button className="min-w-max grow flex justify-around items-center gap-2 border rounded-md border-gray-700 p-1" onClick={() => setIsEditing(true)}>
                            <Image src={editIcon} width="24" height="24" alt="Icon to edit the item`" />
                            <div className="text-sm">Edit</div>
                        </button>
                        <button className="min-w-max grow flex justify-around items-center gap-2 border rounded-md border-gray-700 p-1" onClick={() => setIsShowingMore(false)}>
                            <Image src={cancelIcon} width="24" height="24" alt="Icon to cancel the edit" />
                            <div className="text-sm">Cancel</div>
                        </button>
                        <button id={att.uuid}
                            onClick={deleteAttachment} className="min-w-max grow flex justify-around items-center gap-2 border rounded-md bg-red-100 hover:bg-red-400 border-red-500 p-1" >
                            <Image src={deleteIcon} width="24" height="24" alt="Icon to edit the name" />
                            <div className="text-sm">Delete</div>
                        </button>
                    </div>}
            </div>
            :
            <>
                <AttachmentItemEditable
                    key={`attachment-editable-${att.uuid}`}
                    attachment={att}
                    onCancel={() => setIsEditing(false)}
                    onEdit={(_att: IAttachment) => { onEdit(_att) }}
                />
            </>
        }</>)
}

export default SyllabusResource