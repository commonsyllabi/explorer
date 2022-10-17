import models from "models.json"
import i18n from "@cospired/i18n-iso-languages";
i18n.registerLocale(require("@cospired/i18n-iso-languages/langs/en.json"));

import { getAcademicLevelText } from "./getAcademicLevel"

export const getLevelsFilters = (levels: string[]) => {
    levels.sort()
    const levelsElements = levels.map(l => (
        <option value={l} key={l}>{getAcademicLevelText(parseInt(l))}</option>
    ))

    return levelsElements
}

export const getFieldsFilters = (fields: string[]) => {
    fields.sort()
    const fieldsElements = fields.map(l => {
        if (l === "0") l = "000" // todo - hmmm

        const name = models.ACADEMIC_FIELDS[l as keyof typeof models.ACADEMIC_FIELDS]

        return (
            <option value={l} key={l}>{name}</option>
        )
    })

    return fieldsElements
}

export const getLanguagesFilters = (languages: string[]) => {
    languages.sort()
    const languagesElements = languages.map(l => {
        const lang = i18n.getName(l, "en")
        return (
            <option value={l} key={l}>{lang}</option>
        )
    })

    return languagesElements
}

export const getYearsFilters = (years: string[]) => {
    years.sort()
    const yearsElements = years.map(l => (
        <option value={l} key={l}>{l}</option>
    ))

    return yearsElements
}