import AttachmentItemEditable from "components/NewSyllabus/AttachmentItemEditable";
import { useState } from "react";
import { IAttachment } from "types";
import SyllabusAttachment from "./SyllabusAttachment";
import Image from "next/image";
import editIcon from '../../public/icons/edit-box-line.svg'
import cancelIcon from '../../public/icons/close-line.svg'
import checkIcon from '../../public/icons/check-line.svg'

interface ISyllabusResourceProps {
    att: IAttachment,
    onDelete: Function,
    onEdit: Function,
    isAdmin: boolean
}

const SyllabusResource: React.FunctionComponent<ISyllabusResourceProps> = ({ att, onDelete, onEdit, isAdmin }) => {    
    const [isEditing, setIsEditing] = useState(false);

    return (<>
        {!isEditing ?
            <div className="flex items-center">
                <SyllabusAttachment
                    resourceTitle={att.name}
                    resourceUrl={att.url ? att.url : ""}
                    resourceDescription={att.description ? att.description : ""}
                    resourceType={att.type}
                    key={att.uuid}
                />
                {isAdmin && !isEditing ?
                    <button className="ml-8" onClick={() => setIsEditing(true)}>
                        <Image src={editIcon} width="24" height="24" alt="Icon to edit the title" />
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
                    <button className="flex items-center gap-2 rounded-lg border border-1 border-gray-900 py-1 px-2">
                        <Image src={checkIcon} width="24" height="24" alt="Icon to save the edit process" />
                        <div>Save</div>
                    </button>
                </div>
            </>
        }</>)
}

export default SyllabusResource