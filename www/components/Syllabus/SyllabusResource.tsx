import AttachmentItemEditable from "components/NewSyllabus/AttachmentItemEditable";
import { useContext, useState } from "react";
import { IAttachment } from "types";
import SyllabusAttachment from "./SyllabusAttachment";
import Image from "next/image";
import editIcon from '../../public/icons/edit-line.svg'
import cancelIcon from '../../public/icons/close-line.svg'
import checkIcon from '../../public/icons/check-line.svg'
import { EditContext } from "context/EditContext";

interface ISyllabusResourceProps {
    att: IAttachment,
    onDelete: Function,
    onEdit: Function,
}

const SyllabusResource: React.FunctionComponent<ISyllabusResourceProps> = ({ att, onDelete, onEdit }) => {    
    const ctx = useContext(EditContext)
    const [isEditing, setIsEditing] = useState(false);

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
                {ctx.isOwner && !isEditing ?
                    <button className="flex items-stretch gap-2 border rounded-md border-gray-700 w-max p-1 pr-4" onClick={() => setIsEditing(true)}>
                        <Image src={editIcon} width="24" height="24" alt="Icon to edit the title" />
                        <div className="text-sm m-auto">Edit</div>
                    </button> : <></>}
            </div>
            :
            <>
                <AttachmentItemEditable
                    key={`attachment-editable-${att.uuid}`}
                    attachment={att}
                    onDelete={(_uuid: string) => { onDelete(_uuid) }}
                    onEdit={(_att: IAttachment) => { onEdit(_att) }}
                />
                <div className="py-1 mt-2 flex flex-col lg:flex-row gap-2 justify-between">
                    <button className="flex items-center gap-2 rounded-lg border border-1 border-gray-900 py-1 px-2 bg-red-100 hover:bg-red-300" onClick={() => { setIsEditing(false); }}>
                        <Image src={cancelIcon} width="24" height="24" alt="Icon to cancel the edit process" />
                        <div>Cancel</div>
                    </button>
                </div>
            </>
        }</>)
}

export default SyllabusResource