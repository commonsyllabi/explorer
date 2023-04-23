import { getAcademicFieldsText } from "components/utils/getAcademicFields"
import { getAcademicLevelText } from "components/utils/getAcademicLevel"
import { getInstitutionLang } from "components/utils/getInstitutionInfo"
import { signOut, useSession } from "next-auth/react"
import React, { useEffect, useState } from "react"
import Image from "next/image";
import editIcon from '../../public/icons/edit-box-line.svg'
import cancelIcon from '../../public/icons/close-line.svg'
import checkIcon from '../../public/icons/check-line.svg'
import AddAcademicFieldsForm from "components/NewSyllabus/AddAcademicFieldsForm"
import AddAcademicLevelForm from "components/NewSyllabus/AddAcademicLevelForm"
import AddLanguageForm from "components/NewSyllabus/AddLanguage"
import Router from "next/router"
import { ISyllabus } from "types"

interface ISyllabusMetaProps {
    lang: string,
    level: number,
    fields: number[],
    apiUrl: URL,
    isAdmin: boolean,
    onSuccess: Function,
}

const SyllabusMeta: React.FunctionComponent<ISyllabusMetaProps> = ({ lang, level, fields, isAdmin, apiUrl, onSuccess }) => {

    const [literalLevel, setLiteralLevel] = useState<string>('')
    const [literalFields, setLiteralFields] = useState<string[]>([])
    const [literalLanguage, setLiteralLanguage] = useState<string>('')

    const [tmpLevel, setTmpLevel] = useState<string>('')
    const [tmpFields, setTmpFields] = useState<string[]>([])
    const [tmpLanguage, setTmpLanguage] = useState<string>('')

    const [log, setLog] = useState('')
    const [isEditing, setIsEditing] = useState(false);
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

        const res = await fetch(apiUrl, {
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
            <div className="flex gap-4">
                <div className="flex gap-4">
                    <div className={`${literalLanguage ? '' : 'italic'}`}>{literalLanguage ? literalLanguage : 'No language'}</div>
                    <div className={`${literalLevel ? '' : 'italic'}`}>{literalLevel ? literalLevel : 'No academic level'}</div>
                    <div className={`${literalFields ? '' : 'italic'}`}>{literalFields ? literalFields.join(" | ") : 'No academic fields'}</div>
                </div>
                {isAdmin ?
                    <button className="ml-8" onClick={() => setIsEditing(true)}>
                        <Image src={editIcon} width="18" height="18" alt="Icon to edit the field" />
                    </button>
                    : <></>
                }

            </div>
            :
            <div>
                <div className="flex flex-col md:flex-row items-baseline justify-between gap-6 my-4">
                    <AddLanguageForm lang={lang} setLanguage={(_lang: string) => setTmpLanguage(_lang)} />
                    <AddAcademicLevelForm level={'0'} setLevelData={(_lvl: string) => { setTmpLevel(_lvl) }} />
                    <AddAcademicFieldsForm
                        setAcadFieldsData={(_af: string[]) => { setTmpFields(_af); }}
                        academicFields={[]}
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