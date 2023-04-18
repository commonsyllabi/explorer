import { IInstitution } from "types";
import { getCountryFromCode, getLanguageFromCode } from "./formUtils";

export const getInstitutionName = (
  institutionsArray: IInstitution[] | undefined
) => {
  if (institutionsArray && institutionsArray[0])
    return institutionsArray[0]["name"];

  return null;
};

export const getInstitutionCountry = (
  institutionsArray: IInstitution[] | undefined
) => {
  if (institutionsArray && institutionsArray[0]) {
    const c = getCountryFromCode(institutionsArray[0]["country"])
    return c;
  }

  return null;
};

export const getInstitutionLang = (
  lang: string
) => {
  return getLanguageFromCode(lang)
};

export const getInstitutionTermInfo = (
  institutionsArray: IInstitution[] | undefined
) => {
  if (institutionsArray && institutionsArray[0])
    if (institutionsArray[0]["date"])
      return institutionsArray[0].date.term;

  return null;
};

export const getInstitutionYearInfo = (
  institutionsArray: IInstitution[] | undefined
) => {
  if (institutionsArray && institutionsArray[0])
    if (institutionsArray[0]["date"])
      return institutionsArray[0].date.year;

  return null;
};
