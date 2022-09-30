import SyllabusCard from "components/SyllabusCard";

import { ISyllabus } from "types";

export const getSyllabusCards = (
  syllabiArray: ISyllabus[] | undefined,
  userName: string,
  isAdmin?: boolean
) => {
  if (!syllabiArray || syllabiArray.length === 0) {
    return null;
  }

  const syllabiCards = syllabiArray.map((item) => (
    <SyllabusCard
      key={item.uuid}
      userName={userName}
      props={item}
      isAdmin={isAdmin ? isAdmin : false}
    />
  ));

  return <div className="d-flex flex-column gap-3">{syllabiCards}</div>;
};
