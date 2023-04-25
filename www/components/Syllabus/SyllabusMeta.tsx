import { getAcademicFieldsText } from "components/utils/getAcademicFields"
import { getAcademicLevelText } from "components/utils/getAcademicLevel"
import { getInstitutionLang } from "components/utils/getInstitutionInfo"
import { signOut, useSession } from "next-auth/react"
import { useContext, useEffect, useState } from "react"
import Image from "next/image";
import editIcon from '../../public/icons/edit-line.svg'
import cancelIcon from '../../public/icons/close-line.svg'
import checkIcon from '../../public/icons/check-line.svg'
import AddAcademicFieldsForm from "components/NewSyllabus/AddAcademicFieldsForm"
import AddAcademicLevelForm from "components/NewSyllabus/AddAcademicLevelForm"
import AddLanguageForm from "components/NewSyllabus/AddLanguage"
import Router from "next/router"
import { ISyllabus } from "types"
import { EditContext } from "context/EditContext"

interface ISyllabusMetaProps {
    lang: string,
    level: number,
    fields: number[],
    onSuccess: Function,
}

const SyllabusMeta: React.FunctionComponent<ISyllabusMetaProps> = ({ lang, level, fields, onSuccess }) => {
    const ctx = useContext(EditContext)
    const [literalLevel, setLiteralLevel] = useState<string>('')
    const [literalFields, setLiteralFields] = useState<string[]>([])
    const [literalLanguage, setLiteralLanguage] = useState<string>('')

    const [tmpLevel, setTmpLevel] = useState<string>('')
    const [tmpFields, setTmpFields] = useState<string[]>([])
    const [tmpLanguage, setTmpLanguage] = useState<string>('')

    const [log, setLog] = useState('')
    const [isEditing, setIsEditing] = useState(false);
    const [isShowingTooltip, setShowTooltip] = useState(false)
    const { data: session } = useSession();

    useEffect(() => {
        setLiteralLevel(getAcademicLevelText(level) as string)
        setLiteralFields(getAcademicFieldsText(fields))
        setLiteralLanguage(getInstitutionLang(lang))
    }, [level, fields, lang])

    const submitEdit = async () => {
        const h = new Headers();
        h.append("Authorization", `Bearer ${session?.user.token}`);

        let b = new FormData()
        tmpFields.forEach(af => {
            b.append("academic_fields[]", af)
        })
        b.append("language", tmpLanguage)
        b.append("academic_level", tmpLevel)

        const endpoint = new URL(`/syllabi/${ctx.syllabusUUID}`, process.env.NEXT_PUBLIC_API_URL)
        const res = await fetch(endpoint, {
            method: 'PATCH',
            headers: h,
            body: b
        })

        if (res.ok) {
            const data: ISyllabus = await res.json()
            onSuccess({
                academic_level: data.academic_level,
                academic_fields: data.academic_fields,
                language: data.language,
            })
            setIsEditing(false)
        } else if (res.status == 401) {
            signOut({ redirect: false }).then((result) => {
                Router.push("/auth/signin");
            })
        } else {
            const body = res.text()
            setLog(`An error occured while saving: ${body}`)
        }
    }

    return (<>
        {!isEditing ?
            <div className="flex flex-col gap-2">
                <div className="flex md:flex-row justify-between gap-4">
                    <div data-cy="course-language" className={`${literalLanguage ? '' : 'italic'}`}>{literalLanguage ? literalLanguage : 'No language'}</div>
                    <div data-cy="course-level" className={`${literalLevel ? '' : 'italic'}`}>{literalLevel ? literalLevel : 'No academic level'}</div>
                    <div data-cy="course-fields" className={`flex flex-col items-end md:flex-row gap-0 md:gap-2 ${literalFields ? '' : 'italic'}`}>{literalFields ? literalFields.map((l, i) => {
                        return(<div className="text-right" key={`field-${i}`}>{l}</div>)
                    }) : <div>No academic fields</div>}</div>
                </div>
                {ctx.isOwner && !isEditing ?
                    <button className={`flex gap-2 opacity-70 border ${isShowingTooltip ? '' : 'opacity-40'} rounded-md border-gray-700 w-max p-1`} onClick={() => setIsEditing(true)} onMouseEnter={() => { setShowTooltip(true) }} onMouseLeave={() => { setShowTooltip(false) }}>
                        <Image src={editIcon} width="24" height="24" className="h-4" alt="Icon to edit the list" />
                        <div className={`${isShowingTooltip ? '' : 'hidden'} text-sm`}>Edit</div>
                    </button>
                    : <></>}
            </div>
            :
            <div className="w-2/3">
                <div className="flex flex-col md:flex-row items-baseline justify-between gap-6 my-4">
                    <AddLanguageForm lang={lang} setLanguage={(_lang: string) => setTmpLanguage(_lang)} />
                    <AddAcademicLevelForm level={level.toString()} setLevelData={(_lvl: string) => { setTmpLevel(_lvl) }} />
                    <AddAcademicFieldsForm
                        setAcadFieldsData={(_af: string[]) => { setTmpFields(_af); }}
                        academicFields={fields.map((af) => { return af.toString() })}
                    />
                </div>
                <div className="py-1 mt-4 flex flex-col lg:flex-row gap-2 justify-between">
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
        }
    </>
    )
}


export default SyllabusMeta