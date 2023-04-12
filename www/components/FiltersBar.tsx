import * as React from "react";
import Image from "next/image";
import { ISyllabiFilters, IMetaInformation } from "../types"
import { getFieldsFilters, getLanguagesFilters, getLevelsFilters, getYearsFilters } from "./utils/getSearchFilters";
import plusIcon from '../public/icons/add-line.svg'
import minusIcon from '../public/icons/subtract-line.svg'

interface syllabiFiltersProps {
  updateFilters: (filters: ISyllabiFilters) => void;
  meta: IMetaInformation
}

const FiltersBar: React.FunctionComponent<syllabiFiltersProps> = (props) => {
  const [isShown, setIsShown] = React.useState(false)
  const [filters, setFilters] = React.useState<ISyllabiFilters>({
    academic_level: "",
    academic_field: "",
    academic_year: "",
    language: "",
    tags_include: [],
    tags_exclude: [],
  })

  React.useEffect(() => {
    props.updateFilters(filters)
  }, [filters])

  //-- todo : generate the options dropdown html given the meta props (might be annoying to deal with fields and levels)

  const handleChange = (e: React.SyntheticEvent) => {
    const t = e.target as HTMLInputElement
    setFilters({ ...filters, [t.id]: t.value })
  }

  const handleReset = (e: React.SyntheticEvent) => {
    setFilters({
      academic_level: "",
      academic_field: "",
      academic_year: "",
      language: "",
      tags_include: [],
      tags_exclude: [],
    })
  }

  return (
    <div className="py-3 flex flex-col gap-3">
      
      <div className="flex justify-between">
        <h2 className="text-lg font-bold">Search filters</h2>
        <div className="md:hidden">
          <button className={`${isShown ? 'hidden' : ''}`} onClick={() => setIsShown(true)}>
            <Image src={plusIcon} width="24" height="24" alt="Icon to reveal the search filters" />
          </button>
          <button className={`${isShown ? '' : 'hidden'}`} onClick={() => setIsShown(false)}>
            <Image src={minusIcon} width="24" height="24" alt="Icon to hide the search filters" />
          </button>
        </div>
      </div>

      <div className={`${isShown ? 'block' : 'hidden'} md:block`}>
        {/* FILTER BY ACAD LEVEL */}
        <form className="flex flex-col">
          <label className="text-sm mb-2">Academic Level</label>
          <select
            className="bg-transparent"
            id="academic_level"
            value={filters.academic_level}
            data-cy="filtersAcademicLevel"
            onChange={handleChange}>
            <option value="">All</option>
            {getLevelsFilters(props.meta.academic_levels)}
          </select>
        </form>


        {/* FILTER BY ACADEMIC TERM */}
        <form className="flex flex-col">
          <label className="text-sm mb-2">Academic Year</label>
          <select
            className="bg-transparent"
            id="academic_year"
            value={filters.academic_year}
            data-cy="filtersAcademicYear"
            onChange={handleChange}>
            <option value="">All</option>
            {getYearsFilters(props.meta.academic_years)}
          </select>
        </form>


        {/* FILTER BY ACADEMIC FIELDS */}
        <form className="flex flex-col">
          <label className="text-sm mb-2">Academic Field</label>
          <select
            className="bg-transparent"
            id="academic_field"
            value={filters.academic_field}
            data-cy="filtersAcademicField"
            onChange={handleChange}>
            <option value="">All</option>
            {getFieldsFilters(props.meta.academic_fields)}
          </select>
        </form>


        {/* FILTER BY LANGUAGE */}
        <form className="flex flex-col">
          <label className="text-sm mb-2">Language / Region</label>
          <select
            className="bg-transparent"
            id="language"
            value={filters.language}
            data-cy="filtersLanguage"
            onChange={handleChange}>
            <option value="">All</option>
            {getLanguagesFilters(props.meta.languages)}
          </select>
        </form>


        {/* FILTER BY TAGS */}
        <div id="tag-search-inputs" className="mt-6">
          <div>
            <form className="flex flex-col">
              <label className="text-sm mb-2" id="search-includes-tags">
                <strong>Include</strong> courses with these tags:
              </label>
              <textarea
                className="bg-transparent border border-gray-900"
                aria-labelledby="search-includes-tags"
                id="tags_include"
                value={filters.tags_include}
                data-cy="filtersTagsInclude"
                onChange={handleChange}
              />
            </form>
          </div>
          <div>
            <form className="flex flex-col">
              <label className="text-sm mb-2" id="search-excludes-tags">
                <strong>Exclude</strong> courses with these tags:
              </label>
              <textarea
                className="bg-transparent border border-gray-900"
                aria-labelledby="search-excludes-tags"
                id="tags_exclude"
                value={filters.tags_exclude}
                data-cy="filtersTagsExclude"
                onChange={handleChange}
              />
            </form>
          </div>
          <button onClick={handleReset} className="border border-gray-600 p-2 rounded-lg mt-4 w-full" data-cy="filtersReset">Reset filters</button>
        </div>
      </div>
    </div>
  );
};

export default FiltersBar;
