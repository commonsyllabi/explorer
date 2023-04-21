import { signOut, useSession } from "next-auth/react";
import Router from "next/router";
import * as React from "react";
import { useState } from "react";
import Image from "next/image";
import editIcon from '../../public/icons/edit-box-line.svg'
import cancelIcon from '../../public/icons/close-line.svg'
import checkIcon from '../../public/icons/check-line.svg'
import { kurintoSerif } from "app/layout";

interface ISyllabusTextFormFieldProps {
    info: string,
    label: string,
    isAdmin: boolean,
    apiUrl: URL,
}

const SyllabusTextFormField: React.FunctionComponent<ISyllabusTextFormFieldProps> = ({ info, label, isAdmin, apiUrl }) => {

    const [log, setLog] = useState('')
    const [isEditing, setIsEditing] = useState(false);
    const [original, setOriginal] = useState(info ? info as string : '')
    const [tmp, setTmp] = useState(original)
    const { data: session } = useSession();
    const keyLabel = label.toLowerCase().split(" ").join("_")

    const handleChange = (e: React.BaseSyntheticEvent) => {
        e.preventDefault()
        setTmp(e.target.value)
    }

    const submitEdit = () => {
        if (tmp.length < 2) {
            setLog("field cannot be empty")
            return
        }

        const h = new Headers();
        h.append("Authorization", `Bearer ${session?.user.token}`);

        let b = new FormData()
        b.append(`${keyLabel}`, tmp)

        fetch(apiUrl, {
            method: 'PATCH',
            headers: h,
            body: b
        })
            .then((res) => {
                if (res.ok) {
                    setIsEditing(false)
                    setOriginal(tmp)
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
            <div className="flex gap-2 items-center mb-2">
                <h2 className={`${kurintoSerif.className} font-bold text-lg`}>{label}</h2>
                {isAdmin && !isEditing ?
                    <button className="ml-8" onClick={() => setIsEditing(true)}>
                        <Image src={editIcon} width="24" height="24" alt="Icon to edit the title" />
                    </button>
                    : <></>}
            </div>
            {isEditing ?
                <div className="w-2/3 flex flex-col justify-between">
                    <textarea className={`p-0 m-0 w-full bg-transparent pb-1 border-b-2 border-b-gray-900`} rows={8} value={tmp} onChange={handleChange} />

                    <div className="py-1 mt-2 flex flex-col lg:flex-row gap-2 justify-between">
                        <button className="flex gap-2 rounded-lg border border-1 border-gray-900 py-1 px-2 bg-red-100 hover:bg-red-300" onClick={() => { setIsEditing(false); }}>
                            <Image src={cancelIcon} width="24" height="24" alt="Icon to cancel the edit process" />
                            <div>Cancel</div>
                        </button>
                        <button className="flex gap-2 rounded-lg border border-1 border-gray-900 py-1 px-2" onClick={submitEdit}>
                            <Image src={checkIcon} width="24" height="24" alt="Icon to save the edit process" />
                            <div>Save</div>
                        </button>
                    </div>

                    <div>{log}</div>
                </div>
                :
                <div className="flex gap-2">
                    <div className={`${original.length == 0 ? 'text-sm text-gray-400' : ''} whitespace-pre-wrap`}>
                        {original.length == 0 ? `No ${label.toLowerCase()}.` : original}
                    </div>
                </div>
            }
        </div>
    );
};

export default SyllabusTextFormField;
