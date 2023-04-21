import React, { useState } from "react";

interface IAddAcademicLevelFormProps {
    level: string,
    setLevelData: Function,
}

const AddAcademicLevelForm: React.FunctionComponent<IAddAcademicLevelFormProps> = ({ level, setLevelData }) => {
    const [tmp, setTmp] = useState<string>(level)
    const handleChange = (e: React.BaseSyntheticEvent) => {
        e.preventDefault()
        e.stopPropagation()

        setTmp(e.target.value)
        setLevelData(e.target.value)
    }
    return (
        <div className="w-full md:w-1/3">
            <label htmlFor="academic_level">
                Academic Level
            </label>
            <select
                className="w-full bg-transparent mt-2 p-1 border-2 border-gray-900"
                id="academic_level"
                onChange={handleChange}
                value={tmp}
                data-cy="academicLevelInput"
            >
                <option value="0">Other</option>
                <option value="1">Bachelor</option>
                <option value="2">Master</option>
                <option value="3">Doctoral</option>
            </select>
        </div>
    )
}

export default AddAcademicLevelForm;