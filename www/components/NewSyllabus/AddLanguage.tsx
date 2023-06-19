import { generateLanguageOptions } from "components/utils/formUtils";
import React, { useState } from "react";

interface IAddLanguageFormProps {
  lang: string,
  setLanguage: Function,
}

const AddLanguageForm: React.FunctionComponent<IAddLanguageFormProps> = ({ lang, setLanguage }) => {
  const [tmp, setTmp] = useState<string>(lang)

  const handleChange = (e: React.BaseSyntheticEvent) => {
    e.preventDefault()
    e.stopPropagation()

    setTmp(e.target.value)
    setLanguage(e.target.value)
  }
  return (
    <div className="w-1/3 md:w-1/4 flex flex-col">
      <label htmlFor="language">Language*</label>
      <select
        className="bg-transparent mt-2 p-1 border-2 border-gray-900"
        id="language"
        onChange={handleChange}
        value={tmp.toUpperCase()}
        data-cy="courseLanguageInput"
      >
        <option value="">—</option>
        {generateLanguageOptions()}
      </select>
      <div className="text-sm">
        The language in which this course was
        taught.
      </div>
    </div>
  )
}

export default AddLanguageForm;