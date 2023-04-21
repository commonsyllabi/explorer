import { getInstitutionCountry, getInstitutionName, getInstitutionTermInfo, getInstitutionYearInfo } from "components/utils/getInstitutionInfo"
import { useEffect, useState } from "react"
import { IInstitution } from "types"

interface IInstitutionMetaProps {
    institutions: IInstitution[],
    apiUrl: URL,
    isAdmin: boolean,
}

const InstitutionMeta: React.FunctionComponent<IInstitutionMetaProps> = ({ institutions, isAdmin, apiUrl }) => {

    const [literalName, setLiteralName] = useState<string>('')
    const [literalCountry, setLiteralCountry] = useState<string>('')
    const [literalYear, setLiteralYear] = useState<string>('')
    const [literalTerm, setLiteralTerm] = useState<string>('')

    useEffect(() => {        
        if(!institutions) return

        setLiteralName(getInstitutionName(institutions) as string)
        setLiteralCountry(getInstitutionCountry(institutions) as string)
        setLiteralYear(getInstitutionYearInfo(institutions) as string)
        setLiteralTerm(getInstitutionTermInfo(institutions) as string)
    }, [institutions])

    return (<>
        <div className={`${literalName ? '' : 'italic'}`}>{literalName ? literalName : 'No name'}</div>
        <div className={`${literalCountry ? '' : 'italic'}`}>{literalCountry ? literalCountry : 'No country'}</div>
        <div className={`${literalTerm ? '' : 'italic'}`}>{literalTerm ? literalTerm : 'No term'}</div>
        <div className={`${literalYear ? '' : 'italic'}`}>{literalYear ? literalYear : 'No term'}</div>
    </>
    )
}

export default InstitutionMeta