import { signOut, useSession } from "next-auth/react";
import Router from "next/router";
import { useContext, useState } from "react";
import Image from "next/image";
import editIcon from '../../public/icons/edit-line.svg'
import cancelIcon from '../../public/icons/close-line.svg'
import checkIcon from '../../public/icons/check-line.svg'
import addIcon from '../../public/icons/add-line.svg'
import removeIcon from '../../public/icons/subtract-line.svg'
import { kurintoSerif } from "app/layout";
import { EditContext } from "context/EditContext";

interface ISyllabusListFormFieldProps {
    info: string[],
    label: string,
}

const SyllabusListFormField: React.FunctionComponent<ISyllabusListFormFieldProps> = ({ info, label }) => {
    const ctx = useContext(EditContext)
    const [log, setLog] = useState('')
    const [isEditing, setIsEditing] = useState(false);
    const [isShowingTooltip, setShowTooltip] = useState(false)
    const [fields, setFields] = useState(info ? info : [''])
    const [tmp, setTmp] = useState(fields)
    const { data: session } = useSession();
    const keyLabel = label.toLowerCase().split(" ").join("-")

    const handleChange = (e: React.BaseSyntheticEvent) => {
        e.preventDefault()
        const t = e.target;
        tmp[t.dataset.index] = t.value;
        setTmp(tmp)
    }

    const add = () => {
        setTmp([...tmp, ""])
    }

    const remove = (e: React.BaseSyntheticEvent) => {
        const i = e.target.dataset.index
        tmp.splice(i, 1)

        setTmp([...tmp])
    }

    const submitEdit = () => {
        const h = new Headers();
        h.append("Authorization", `Bearer ${session?.user.token}`);

        let b = new FormData()
        for (const t of tmp)
            b.append(`${keyLabel.replaceAll("-", "_")}[]`, t)

        const endpoint = new URL(`/syllabi/${ctx.syllabusUUID}`, process.env.NEXT_PUBLIC_API_URL)
        fetch(endpoint, {
            method: 'PATCH',
            headers: h,
            body: b
        })
            .then((res) => {
                if (res.ok) {
                    setIsEditing(false)
                    setFields(tmp)
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
        <div className="w-full mt-5 mb-8 flex flex-col">
            <div className="flex flex-col gap-2 mb-2" data-cy={`course-${keyLabel}`}>
                {!isEditing ?
                    <div>
                        <div className="flex gap-3 items-center mb-2">
                            {ctx.isOwner ?
                                <button data-cy="edit-button" className={`flex gap-2 opacity-70 border ${isShowingTooltip ? '' : 'opacity-40'} rounded-md border-gray-700 w-max p-1`} onClick={() => setIsEditing(true)} onMouseEnter={() => { setShowTooltip(true) }} onMouseLeave={() => { setShowTooltip(false) }}>
                                    <Image src={editIcon} width="24" height="24" alt="Icon to edit the list" />
                                    <div className={`${isShowingTooltip ? '' : 'hidden'} text-sm`}>Edit</div>
                                </button>
                                : <></>}
                            <h2 className={`${kurintoSerif.className} font-bold text-lg`}>{label}</h2>

                        </div>
                        <ul className="list-inside list-disc">
                            {fields.map((lo, i) => (
                                <li data-cy={`course-${keyLabel}-item`} key={`${keyLabel}-${i}`} className={`${lo.length == 0 ? 'text-sm text-gray-400' : ''} whitespace-pre-wrap`}>
                                    {lo.length == 0 ? `No ${label.toLowerCase()}.` : lo}
                                </li>
                            ))}
                        </ul>
                    </div>
                    :
                    <></>
                }
            </div>
            {isEditing ?
                <div className="md:w-2/3 flex flex-col justify-between">
                    <ul className="mb-2" data-cy={`edit-course-${keyLabel}`}>
                        {tmp.map((item, _index) => (
                            <li key={`${item}-${_index}`} className="flex gap-2">
                                <input type="text" defaultValue={item} data-index={_index} onChange={handleChange} className="w-11/12 bg-transparent mt-2 py-1 border-b-2 border-b-gray-900"></input>
                                <button data-index={_index} onClick={remove} className="flex items-stretch gap-2 bg-gray-200 rounded-md w-max p-1">
                                    <Image src={removeIcon} width="24" height="24" alt="Icon to remove an element from the list" className="m-auto" />
                                </button>
                            </li>
                        ))}
                    </ul>
                    <button data-cy={`add-new-button`} onClick={add} className="flex">
                        <Image src={addIcon} width="24" height="24" alt="Icon to add an element to the list" />
                        <div>Add a new item</div>
                    </button>

                    <div className="py-1 mt-2 flex flex-col md:flex-row gap-2 justify-between">
                        <button className="flex items-center gap-2 rounded-lg border border-1 border-gray-900 py-1 px-2 bg-red-100 hover:bg-red-300" onClick={() => { setIsEditing(false); }}>
                            <Image src={cancelIcon} width="24" height="24" alt="Icon to cancel the edit process" />
                            <div>Cancel</div>
                        </button>
                        <button className="flex items-center gap-2 rounded-lg border border-1 border-gray-900 py-1 px-2" data-cy="save-button" onClick={submitEdit}>
                            <Image src={checkIcon} width="24" height="24" alt="Icon to save the edit process" />
                            <div>Save</div>
                        </button>
                    </div>

                    <div>{log}</div>
                </div>
                :
                <></>
            }
        </div>
    );
};

export default SyllabusListFormField;
