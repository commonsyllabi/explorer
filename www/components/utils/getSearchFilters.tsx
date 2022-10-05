// TODO
// -- convert from fields to readable
// -- convert from languages to readable

import { getAcademicLevelText } from "./getAcademicLevel"

export const getLevelsFilters = (levels: string[]) => {
    levels.sort()
    const levelsElements = levels.map(l => (
        <option value={l}>{getAcademicLevelText(parseInt(l))}</option>
    ))

    return levelsElements
}

export const getFieldsFilters = (fields: string[]) => {
    fields.sort()
    const fieldsElements = fields.map(l => (
        <option value={l}>{l}</option>
    ))

    return fieldsElements
}

export const getLanguagesFilters = (languages: string[]) => {
    languages.sort()
    const languagesElements = languages.map(l => (
        <option value={l}>{l}</option>
    ))

    return languagesElements
}

export const getYearsFilters = (years: string[]) => {
    years.sort()
    const yearsElements = years.map(l => (
        <option value={l}>{l}</option>
    ))

    return yearsElements
}