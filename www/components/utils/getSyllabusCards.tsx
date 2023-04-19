import SyllabusCard from "components/Syllabus/SyllabusCard";

import { ISyllabiFilters, ISyllabus } from "types";

export const getSyllabusCards = (
  syllabiArray: ISyllabus[] | undefined,
  filters: ISyllabiFilters | undefined,
  isAdmin: boolean | false,
  activePage?: number,
) => {
  let syllabiCards;

  if (!syllabiArray || syllabiArray.length === 0) {
    return [];
  }

  const isShown = (filters: ISyllabiFilters, item: ISyllabus): boolean => {

    if (
      filters.academic_level !== "" &&
      item.academic_level?.toString() != filters.academic_level
    )
      return false;

    if (filters.language !== "" && item.language !== filters.language)
      return false;

    if (
      filters.academic_field !== "" &&
      !item.academic_fields?.includes(parseInt(filters.academic_field))
    )
      return false;

    if (
      filters.academic_year !== "" &&
      item.institutions !== undefined &&
      item.institutions[0].date.year != filters.academic_year
    )
      return false;

    if (filters.tags_include.length > 0 && item !== undefined) {
      const tags = item.tags as string[];
      let isIncluded = false;
      for (const t of tags) {
        if (filters.tags_include.includes(t)) isIncluded = true;
      }

      if (!isIncluded) return false;
    }

    if (filters.tags_exclude.length > 0 && item !== undefined) {
      const tags = item.tags as string[];
      for (const t of tags) {
        if (filters.tags_exclude.includes(t)) return false;
      }
    }

    return true;
  };

  const PAGINATION_LIMIT = 15;
  let filtered = filters ? syllabiArray.filter((item) => isShown(filters as ISyllabiFilters, item)) : syllabiArray;

  const paginated = (activePage != undefined) ? filtered.filter((item, index) => {
    return (activePage - 1) * PAGINATION_LIMIT <= index && index < (activePage) * PAGINATION_LIMIT;
  }) : filtered

  syllabiCards = paginated.map((item) => (
    <SyllabusCard
      key={item.uuid}
      syllabusInfo={item}
      isAdmin={isAdmin}
    />
  )) as JSX.Element[];


    return syllabiCards;
};
