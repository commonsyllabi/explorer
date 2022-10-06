import SyllabusCard from "components/SyllabusCard";
import { useEffect, useState } from "react";

import { ISyllabiFilters, ISyllabus } from "types";

export const getSyllabusCards = (
  syllabiArray: ISyllabus[] | undefined,
  filters: ISyllabiFilters,
  userName?: string | "anonymous",
  isAdmin?: boolean
) => {
  // const [syllabiCards, setSyllabiCards] = useState<JSX.Element[]>()
  let syllabiCards

  if (!syllabiArray || syllabiArray.length === 0) {
    return;
  }

  const isShown = (filters: ISyllabiFilters, item: ISyllabus): boolean => {
    if (filters.academic_level !== "" && item.academic_level?.toString() != filters.academic_level)
      return false

    if (filters.language !== "" && item.language != filters.language)
      return false

    if (filters.academic_field !== "" && !item.academic_fields?.includes(parseInt(filters.academic_field)))
      return false

    if (filters.academic_year !== "" && item.institutions !== undefined && item.institutions[0].date.year != filters.academic_year)
      return false

    if (filters.tags_include.length != 0 && item !== undefined) {
      const tags = item.tags as string[]
      let isIncluded = false
      for (const t of tags) {
        if (filters.tags_include.includes(t))
          isIncluded = true
      }

      if (!isIncluded)
        return false
    }

    if (filters.tags_exclude.length != 0 && item !== undefined) {
      const tags = item.tags as string[]
      for (const t of tags) {
        if (filters.tags_exclude.includes(t))
          return false
      }
    }

    return true
  }

  // useEffect(() => {
    const sy = syllabiArray.filter(item => isShown(filters, item))
    const sc = sy.map((item) => (
      <SyllabusCard
        key={item.uuid}
        userName={userName}
        props={item}
        isAdmin={isAdmin ? isAdmin : false}
      />
    )
    ) as JSX.Element[]

    syllabiCards = sc
  // }, [filters])


  if (syllabiCards !== undefined && syllabiCards.length > 0)
    return <div className="d-flex flex-column gap-3">{syllabiCards}</div>;
  else
    return <div className="d-flex flex-column gap-3">
      <h1>Sorry!</h1>
      <p>We couldn&apos;t find any syllabi matching your search filters.</p>
    </div>;
};
