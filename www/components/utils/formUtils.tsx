import Form from "react-bootstrap/Form";

import models from "models.json"; //import academic field codes

//Get public/private form label
export const getPublicPrivateLabel = (status: string) => {
  if (status === "unlisted") {
    return "Private (only viewable to you)";
  } else {
    return "Public (anyone can view)";
  }
};

//Data Libraries for Countries adn Languages
const countries = require("i18n-iso-countries");
const languages = require("@cospired/i18n-iso-languages");

//Set up list of countries
const setUpCountries = () => {
  countries.registerLocale(require("i18n-iso-countries/langs/en.json"));
  // console.log(countries.getNames("en", { select: "official" }));
  const countriesList = countries.getNames("en", { select: "official" });
  let numericCountriesList: { [key: string]: string } = {};
  Object.keys(countriesList).forEach((countryAlpha2Code) => {
    const countryNumCode = countries.alpha2ToNumeric(countryAlpha2Code);
    numericCountriesList[countriesList[countryAlpha2Code]] = countryNumCode;
  });
  // console.log(numericCountriesList);
  return numericCountriesList;
};

//Return <option> elements for countries drop down menu
export const generateCountryOptions = () => {
  const countries = setUpCountries();
  const elements = Object.keys(countries).map((countryName) => (
    <option key={countries[countryName]} value={countries[countryName]}>
      {countryName}
    </option>
  ));
  return <>{elements}</>;
};

//Set up list of languages and generate language dropdown elements
const setUpLanguages = () => {
  languages.registerLocale(
    require("@cospired/i18n-iso-languages/langs/en.json")
  );
  // console.log(languages.getNames("en"));
  return languages.getNames("en");
};

//Return <option> elements for languages drop down menu
export const generateLanguageOptions = () => {
  const languages = setUpLanguages();
  const elements = Object.keys(languages).map((langCode) => (
    <option key={langCode} value={langCode.toUpperCase()}>
      {langCode.toUpperCase()} – {languages[langCode]}
    </option>
  ));
  return <>{elements}</>;
};

//Return <Form.Check/> (checkbox) elements for academic fields
export const generateAcademicFieldsCheckboxes = (
  eventHandler: (event: React.SyntheticEvent) => void
) => {
  // console.log(models.ACADEMIC_FIELDS);
  const acadFields: { [key: string]: string } = models.ACADEMIC_FIELDS;
  // Process acadFields into categories

  const acadFieldsCheckboxes = Object.keys(acadFields).map((fieldCode) => (
    <Form.Check
      type="checkbox"
      label={`${acadFields[fieldCode]} [${fieldCode}]`}
      key={fieldCode}
      id={fieldCode}
      onChange={eventHandler}
      data-cy={`academicFieldsInput${acadFields[fieldCode]}`}
      value={acadFields[fieldCode]}
      className="academicFieldInput"
    />
  ));
  return <>{acadFieldsCheckboxes}</>;
};
