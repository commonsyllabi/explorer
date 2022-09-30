import { IInstitution } from "types";

export const getInstitutionName = (
  institutionsArray: IInstitution[] | undefined
) => {
  if (institutionsArray) {
    if (institutionsArray[0]) {
      return institutionsArray[0]["name"];
    }
    return null;
  }
  return null;
};

export const getInstitutionTermInfo = (
  institutionsArray: IInstitution[] | undefined
) => {
  if (institutionsArray) {
    if (institutionsArray[0]) {
      if (institutionsArray[0]["date"]) {
        if (institutionsArray[0].date.term) {
          return institutionsArray[0].date.term;
        }
        return null;
      }
      return null;
    }
    return null;
  }
  return null;
};

export const getInstitutionYearInfo = (
  institutionsArray: IInstitution[] | undefined
) => {
  if (institutionsArray) {
    if (institutionsArray[0]) {
      if (institutionsArray[0]["date"]) {
        return institutionsArray[0].date.year;
      }
      return null;
    }
    return null;
  }
  return null;
};
