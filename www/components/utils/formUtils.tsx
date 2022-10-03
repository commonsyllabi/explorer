import Form from "react-bootstrap/Form";
import { IUploadAttachment, IFormData } from "types"

import models from "models.json"; //import academic field codes
import modelsIsced from "models-isced.json"; //import tiered academic field codes

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
    <option key={`${langCode}}`} value={langCode.toUpperCase()}>
      {langCode.toUpperCase()} – {languages[langCode]}
    </option>
  ));
  return <>{elements}</>;
};

//Return <option> elemtns for ACADEMIC_FIELD data,
//params: ACADEMIC_FIELDS_BROAD, ACADEMIC_FIELDS_NARROW or ACADEMIC_FIELDS_DETAILS
const generateAcademicFields = (ACAD_FIELD_JSON_DATA: {
  [key: string]: string;
}) => {
  const acadFields: { [key: string]: string | { [key: string]: string } } =
    ACAD_FIELD_JSON_DATA;

  const acadFieldsElements = Object.keys(acadFields).map((fieldCode) => (
    <option key={fieldCode} value={fieldCode}>
      <>
        {fieldCode} - {acadFields[fieldCode]}
      </>
    </option>
  ));

  return <>{acadFieldsElements}</>;
};

//Return <option> elements for ACADEMIC_FIELDS_BROAD
export const generateAcadFieldsBroad = () => {
  return generateAcademicFields(modelsIsced.BROAD_FIELDS);
};

//Return <option> elements for ACADEMIC_FIELDS_NARROW
export const generateAcadFieldsNarrow = (broadFieldCode: keyof typeof modelsIsced['NARROW_FIELDS']) => {
    return generateAcademicFields(modelsIsced.NARROW_FIELDS[broadFieldCode]);
};

//Return <option> elements for ACADEMIC_FIELDS_DETAILED
export const generateAcadFieldsDetailed = (narrowFieldCode: keyof typeof modelsIsced['DETAILED_FIELDS']) => {
  return generateAcademicFields(modelsIsced.DETAILED_FIELDS[narrowFieldCode]);
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


export const isValidForm = (form: IFormData, attachments : IUploadAttachment[]) => {
  const messages: string[] = []

  // requirements
  // title > 3 && title < 150
  if (form.title.length < 3 || form.title.length > 150) {
    messages.push(`Title should be between 3 and 150 characters! (currently '${form.title}')`)
  }

  // check description as well

  // language must comply
  if (form.language.length < 2) {
    messages.push(`Language should be BCP-47 compliant! (or at least 2 characters, currently '${form.language}')`)
  }

  // academic_level (come to think of it, this sounds abitrary, compared to not requiring academic_field)
  const ac_levels = [0, 1, 2, 3]
  if (!ac_levels.includes(form.academic_level)) {
    messages.push(`You should pick an academic level: '${form.academic_level}'.)`)
  }


  // check that attachments are not null
  if (attachments.length > 0) {
    console.log(attachments);

    for (const att of attachments) {
      if (att.name.length < 3)
        messages.push(`Check attachments name '${att.name}'`)
      if (att.url != "") {
        let u
        try {
          u = new URL(att.url as string)

          if (att.file !== undefined)
            messages.push(`Can't have both URL and file attachemnt. Please create a separate attachment if you wish to upload both.`)
        } catch {
          messages.push(`Check attachments url '${att.url}'`)
        }
      }

      if (att.file && att.file?.size > 16777216) // 16mb
        messages.push(`Check attachments file '${att.file.name}' size '${att.file.size}B'`)
    }

  }

  // should we check that institution is not null? field names are:
  // name
  // country
  // url
  // year
  // term

  return { errors: messages }
}