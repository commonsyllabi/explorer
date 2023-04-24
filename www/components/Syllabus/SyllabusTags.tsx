import { signOut, useSession } from "next-auth/react";
import Router from "next/router";
import { useContext, useState } from "react";
import Image from "next/image";
import editIcon from '../../public/icons/edit-line.svg'
import cancelIcon from '../../public/icons/close-line.svg'
import checkIcon from '../../public/icons/check-line.svg'
import { kurintoSerif } from "app/layout";
import Tags from "./Tags";
import { EditContext } from "context/EditContext";

interface ISyllabusTagsProps {
    syllabusTags: string[],
    apiUrl: URL,
}

const SyllabusTags: React.FunctionComponent<ISyllabusTagsProps> = ({ syllabusTags, apiUrl }) => {
    const ctx = useContext(EditContext)
    const [log, setLog] = useState('')
    const [isEditing, setIsEditing] = useState(false);
    const [isShowingTooltip, setShowTooltip] = useState(false)
    const [tags, setTags] = useState(syllabusTags ? syllabusTags as string[] : [''])
    const [tmp, setTmp] = useState(tags.join(", "))
    const { data: session } = useSession();

    const handleChange = (e: React.BaseSyntheticEvent) => {
        e.preventDefault()
        setTmp(e.target.value)
    }

    const submitEdit = () => {
        if (tmp.length < 2) {
            setLog("title cannot be empty")
            return
        }

        const h = new Headers();
        h.append("Authorization", `Bearer ${session?.user.token}`);

        let b = new FormData()
        const _tags = tmp.split(",").map(t => t.trim())
        for (const t of _tags)
            b.append("tags[]", t)

        fetch(apiUrl, {
            method: 'PATCH',
            headers: h,
            body: b
        })
            .then((res) => {
                if (res.ok) {
                    setIsEditing(false)
                    setTags(_tags)
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
                setLog(`An error occured while saving: ${body}`)
            })
    }

    return (
        <div className="md:w-1/2 mt-5 mb-8 flex flex-col">
            {isEditing ?
                <div className="flex flex-col justify-between">
                    <input type="text" className={`text-sm p-0 m-0 w-full bg-transparent pb-1 border-b-2 border-b-gray-900`} value={tmp} onChange={handleChange}></input>
                    <div className="py-1 mt-2 flex flex-col lg:flex-row gap-2 justify-between">
                        <button className="flex items-center gap-2 rounded-lg border border-1 border-gray-900 py-1 px-2 bg-red-100 hover:bg-red-300" onClick={() => { setIsEditing(false); }}>
                            <Image src={cancelIcon} width="24" height="24" alt="Icon to cancel the edit process" />
                            <div>Cancel</div>
                        </button>
                        <button className="flex items-center gap-2 rounded-lg border border-1 border-gray-900 py-1 px-2" onClick={submitEdit}>
                            <Image src={checkIcon} width="24" height="24" alt="Icon to save the edit process" />
                            <div>Save</div>
                        </button>
                    </div>
                    <div>{log}</div>
                </div>
                :
                <div className="flex flex-col gap-2">
                    <div id="course-tags" className="flex gap-2">
                        <Tags tags={tags} />
                    </div>
                    {ctx.isOwner ?
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

export default SyllabusTags;
