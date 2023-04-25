import { getInstitutionCountry, getInstitutionName, getInstitutionTermInfo, getInstitutionYearInfo } from "components/utils/getInstitutionInfo"
import { signOut, useSession } from "next-auth/react"
import React, { useContext, useEffect, useState } from "react"
import { IInstitution, ISyllabus } from "types"
import Image from "next/image";
import editIcon from '../../public/icons/edit-line.svg'
import cancelIcon from '../../public/icons/close-line.svg'
import checkIcon from '../../public/icons/check-line.svg'
import { generateCountryOptions } from "components/utils/formUtils";
import Router from "next/router";
import { EditContext } from "context/EditContext";

interface IInstitutionMetaProps {
    institutions: IInstitution[],
    onSuccess: Function,
}

const InstitutionMeta: React.FunctionComponent<IInstitutionMetaProps> = ({ institutions, onSuccess }) => {
    const ctx = useContext(EditContext)
    const [literalName, setLiteralName] = useState<string>('')
    const [literalCountry, setLiteralCountry] = useState<string>('')
    const [literalYear, setLiteralYear] = useState<string>('')
    const [literalTerm, setLiteralTerm] = useState<string>('')

    const [tmpName, setTmpName] = useState<string>('')
    const [tmpCountry, setTmpCountry] = useState<number>()
    const [tmpYear, setTmpYear] = useState<string>('')
    const [tmpTerm, setTmpTerm] = useState<string>('')

    const [log, setLog] = useState('')
    const [isEditing, setIsEditing] = useState(false);
    const [isShowingTooltip, setShowTooltip] = useState(false)
    const { data: session } = useSession();

    useEffect(() => {
        if (!institutions || institutions.length === 0) return
        setLiteralName(getInstitutionName(institutions) as string)
        setLiteralCountry(getInstitutionCountry(institutions) as string)
        setLiteralYear(getInstitutionYearInfo(institutions) as string)
        setLiteralTerm(getInstitutionTermInfo(institutions) as string)
    }, [institutions])

    const handleChange = (e: React.BaseSyntheticEvent) => {
        e.preventDefault()
        e.stopPropagation()
        const t = e.target
        switch (t.id) {
            case 'name':
                setTmpName(t.value)
                break;
            case 'country':
                setTmpCountry(t.value)
                break;
            case 'year':
                setTmpYear(t.value)
                break;
            case 'term':
                setTmpTerm(t.value)
                break;
            default:
                console.warn("unknown institution field:", t.id)
                break;
        }
    }

    const submitEdit = async (e: React.BaseSyntheticEvent) => {
        const h = new Headers();
        h.append("Authorization", `Bearer ${session?.user.token}`);

        let b = new FormData()
        if (tmpName != "")
            b.append("name", tmpName)
        if (tmpCountry)
            b.append("country", tmpCountry.toString())
        if (tmpYear != "")
            b.append("date_year", tmpYear.toString())
        if (tmpTerm != "")
            b.append("date_term", tmpTerm)

        let _endpoint: URL;
        let _method: string;
        if (!institutions || institutions.length === 0) {
            _endpoint = new URL(`/syllabi/${ctx.syllabusUUID}/institutions`, process.env.NEXT_PUBLIC_API_URL)
            _method = 'POST'
        } else {
            _endpoint = new URL(`/syllabi/${ctx.syllabusUUID}/institutions/${institutions[0].uuid}`, process.env.NEXT_PUBLIC_API_URL)
            _method = 'PATCH'
        }

        const res = await fetch(_endpoint, {
            method: _method,
            headers: h,
            body: b
        })

        if (res.ok) {
            const data: IInstitution = await res.json()
            onSuccess({
                uuid: data.uuid,
                name: data.name,
                country: data.country,
                date: {
                    term: data.date.term,
                    year: data.date.year
                },
                url: data.url,
                position: data.position
            })
            setIsEditing(false)
        } else if (res.status == 401) {
            signOut({ redirect: false }).then((result) => {
                Router.push("/auth/signin");
            })
        } else {
            const body = await res.text()
            setLog(`An error occured while saving: ${body}`)
        }
    }


    return (<>
        {!isEditing ?
            <div className="flex flex-col gap-2" data-cy="institution-meta">
                <div className="flex justify-between gap-4">
                    <div data-cy="course-institution-name" className={`${literalName ? '' : 'italic'}`}>{literalName ? literalName : 'No name'}</div>
                    <div data-cy="course-institution-country" className={`${literalCountry ? '' : 'italic'}`}>{literalCountry ? literalCountry : 'No country'}</div>
                    <div data-cy="course-institution-term" className={`${literalTerm ? '' : 'italic'}`}>{literalTerm ? literalTerm : 'No term'}</div>
                    <div data-cy="course-institution-year" className={`${literalYear ? '' : 'italic'}`}>{literalYear ? literalYear : 'No term'}</div>
                </div>
                {ctx.isOwner && !isEditing ?
                    <button className={`flex items-center gap-2 opacity-70 border ${isShowingTooltip ? '' : 'opacity-40'} rounded-md border-gray-700 w-max p-1`} onClick={() => setIsEditing(true)} onMouseEnter={() => {setShowTooltip(true)}} onMouseLeave={() => {setShowTooltip(false)}}>
                        <Image src={editIcon} width="24" height="24" className="h-4" alt="Icon to edit the list" />
                        <div className={`${isShowingTooltip ? '' : 'hidden'} text-xs`}>Edit</div>
                    </button>
                    : <></>}
            </div>
            :
            <div>
                <div className="w-full flex flex-col md:flex-row items-baseline justify-between gap-6 my-2">
                    <div className="w-1/4 flex flex-col">
                        <label>Name of institution</label>
                        <input type="text" id="name" onChange={handleChange} placeholder="e.g. Open University" defaultValue={literalName} className="bg-transparent py-1 border-b-2 border-b-gray-900"
                        data-cy="edit-institution-name" />
                    </div>
                    <div className="w-1/4 flex flex-col">
                        <label>Country of institution</label>
                        <select
                            className="w-full bg-transparent mt-2 p-1 border-2 border-gray-900"
                            id="country"
                            onChange={handleChange}
                            data-cy="edit-institution-country"
                        >
                            <option> — </option>
                            {generateCountryOptions()}
                        </select>
                    </div>
                    <div className="w-1/6 flex flex-col">
                        <label>Term</label>
                        <input type="text" id="term" onChange={handleChange} placeholder="e.g. Spring" defaultValue={literalTerm} className="bg-transparent py-1 border-b-2 border-b-gray-900"
                        data-cy="edit-institution-term"/>
                    </div>
                    <div className="w-1/6 flex flex-col">
                        <label>Year</label>
                        <input type="number" id="year" onChange={handleChange} placeholder="e.g. 2021" defaultValue={literalYear} className="bg-transparent py-1 border-b-2 border-b-gray-900"
                        data-cy="edit-institution-year"
                        />
                    </div>
                </div>
                <div className="py-1 mt-4 flex flex-col md:flex-row gap-2 justify-between">
                    <button className="flex items-center gap-2 rounded-lg border border-1 border-gray-900 py-1 px-2 bg-red-100 hover:bg-red-300" data-cy="cancel-button" onClick={() => { setIsEditing(false); }}>
                        <Image src={cancelIcon} width="24" height="24" alt="Icon to cancel the edit" />
                        <div>Cancel</div>
                    </button>
                    <button className="flex items-center gap-2 rounded-lg border border-1 border-gray-900 py-1 px-2" onClick={submitEdit} data-cy="save-button">
                        <Image src={checkIcon} width="24" height="24" alt="Icon to save the edit" />
                        <div>Save</div>
                    </button>
                </div>
                <div>{log}</div>
            </div >
        }
    </>
    )
}

export default InstitutionMeta