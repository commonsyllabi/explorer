import SyllabusCard from "components/SyllabusCard";

import { ISyllabus } from "types";

export const getSyllabusCards = (syllabiArray: ISyllabus[] | undefined) => {
  if (!syllabiArray || syllabiArray.length === 0) {
    return null;
  }

  //TODO: add params for userName and userUuid?
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
  return <div className="d-flex flex-column gap-3">{syllabiCards}</div>;
};
