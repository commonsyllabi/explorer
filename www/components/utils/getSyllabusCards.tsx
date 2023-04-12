import SyllabusCard from "components/SyllabusCard";
import { useEffect, useState } from "react";

import { ISyllabiFilters, ISyllabus } from "types";

export const getSyllabusCards = (
  syllabiArray: ISyllabus[] | undefined,
  filters: ISyllabiFilters,
  activePage?: number,
  userName?: string | "anonymous",
  isAdmin?: boolean
) => {
  // const [syllabiCards, setSyllabiCards] = useState<JSX.Element[]>()
  let syllabiCards;

  if (!syllabiArray || syllabiArray.length === 0) {
    return;
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
  const filtered = syllabiArray.filter((item) => isShown(filters, item));

  const paginated = (activePage != undefined) ? filtered.filter((item, index) => {
    return (activePage - 1) * PAGINATION_LIMIT <= index && index < (activePage) * PAGINATION_LIMIT;
  }) : filtered

  syllabiCards = paginated.map((item) => (
    <SyllabusCard
      key={item.uuid}
      userName={userName}
      syllabusInfo={item}
      isAdmin={isAdmin ? isAdmin : false}
    />
  )) as JSX.Element[];

  if (syllabiCards !== undefined && syllabiCards.length > 0)
    return {
      elements: <div className="flex flex-col gap-12" data-cy="syllabiCards">{syllabiCards}</div>,
      total: filtered.length
    };
  else
    return ({
      elements: <div className="flex flex-col gap-12" data-cy="syllabiCards">
        <h1 className="text-xl">Sorry!</h1>
        <p>We couldn&apos;t find any syllabi matching your search filters.</p>
      </div>,
      total: 0
    }
    );
};
