import { getAcademicFieldsText } from "components/utils/getAcademicFields"
import { getAcademicLevelText } from "components/utils/getAcademicLevel"
import { getInstitutionLang } from "components/utils/getInstitutionInfo"
import { useEffect, useState } from "react"

interface ISyllabusMetaProps {
    lang: string,
    level: number,
    fields: number[],
    apiUrl: URL,
    isAdmin: boolean,
}

const SyllabusMeta: React.FunctionComponent<ISyllabusMetaProps> = ({ lang, level, fields, isAdmin, apiUrl }) => {

    const [literalLevel, setLiteralLevel] = useState<string>('')
    const [literalFields, setLiteralFields] = useState<string[]>([])
    const [literalLanguage, setLiteralLanguage] = useState<string>('')

    useEffect(() => {
        setLiteralLevel(getAcademicLevelText(level) as string)
        setLiteralFields(getAcademicFieldsText(fields))
        setLiteralLanguage(getInstitutionLang(lang))
    }, [level, fields, lang])

    return (<>
        <div className={`${literalLanguage ? '' : 'italic'}`}>{literalLanguage ? literalLanguage : 'No language'}</div>
        <div className={`${literalLevel ? '' : 'italic'}`}>{literalLevel ? literalLevel : 'No academic level'}</div>
        <div className={`${literalFields ? '' : 'italic'}`}>{literalFields ? literalFields.join(" | ") : 'No academic fields'}</div>
    </>
    )
}

export default SyllabusMeta