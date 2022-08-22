import { ISyllabus } from "types";

const getSyllabiList = (
  syllabiArray: ISyllabus[] | undefined,
  filterPrivate: boolean
) => {
  let syllabiList = [];
  if (syllabiArray) {
    for (let i = 0; i < syllabiArray.length; i++) {
      if (filterPrivate) {
        if (syllabiArray[i].status === "unlisted") {
          let syllabus = {
            uuid: syllabiArray[i].uuid,
            url: "/syllabus/" + syllabiArray[i].uuid,
            title: syllabiArray[i].title,
          };
          syllabiList.push(syllabus);
        }
      } else {
        if (syllabiArray[i].status === "listed") {
          let syllabus = {
            uuid: syllabiArray[i].uuid,
            url: "/syllabus/" + syllabiArray[i].uuid,
            title: syllabiArray[i].title,
          };
          syllabiList.push(syllabus);
        }
      }
    }
  }
  return syllabiList;
};

export const getPrivateSyllabiList = (
  syllabiArray: ISyllabus[] | undefined
) => {
  return getSyllabiList(syllabiArray, true);
};

export const getPublicSyllabiList = (syllabiArray: ISyllabus[] | undefined) => {
  return getSyllabiList(syllabiArray, false);
};
