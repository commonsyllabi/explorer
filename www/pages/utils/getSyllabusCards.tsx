import SyllabusCard from "components/SyllabusCard";

import { ISyllabus } from "types";

export const getSyllabusCards = (syllabiArray: ISyllabus[]) => {
  if (syllabiArray.length > 0) {
    const syllabiCards = syllabiArray.map((item) => (
      <SyllabusCard
        key={item.uuid}
        uuid={item.uuid}
        status={item.status}
        title={item.title}
        year={item.year}
        courseNumber={item.course_number}
        author={item.user.name}
        authorUUID={item.user_uuid}
        description={item.description}
        tags={item.tags}
      />
    ));
    return syllabiCards;
  }
  return null;
};
