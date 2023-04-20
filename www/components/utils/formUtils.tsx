import { IUploadAttachment, IFormData, IFormInstitution } from "types"

import models from "models.json"; //import academic field codes
import modelsIsced from "models-isced.json"; //import tiered academic field codes

//Get public/private form label
export const getPublicPrivateLabel = (status: string) => {
  return status === "unlisted" ? "Private (only viewable to you)" : "Public (anyone can view)";
};

//Data Libraries for Countries adn Languages
const countries = require("i18n-iso-countries");
const languages = require("@cospired/i18n-iso-languages");

//Set up list of countries
const setUpCountries = () => {
  countries.registerLocale(require("i18n-iso-countries/langs/en.json"));
  const countriesList = countries.getNames("en", { select: "official" });
  let numericCountriesList: { [key: string]: string } = {};
  Object.keys(countriesList).forEach((countryAlpha2Code) => {
    const countryNumCode = countries.alpha2ToNumeric(countryAlpha2Code);
    numericCountriesList[countriesList[countryAlpha2Code]] = countryNumCode;
  });
  return numericCountriesList;
};

//Return <option> elements for countries drop down menu
export const generateCountryOptions = () => {
  const countries = setUpCountries();
  const elements = Object.keys(countries).map((countryName) => (
    <option key={countries[countryName]} value={parseInt(countries[countryName])}>
      {countryName}
    </option>
  ));
  return <>{elements}</>;
};

export const getCountryFromCode = (_code: number) => {
  const countries = setUpCountries()
  let country = ""
  Object.keys(countries).map(c => {
    if (parseInt(countries[c]) === _code)
      country = c
  })
  return country
}

//Set up list of languages and generate language dropdown elements
const setUpLanguages = () => {
  languages.registerLocale(
    require("@cospired/i18n-iso-languages/langs/en.json")
  );
  return languages.getNames("en");
};

//Return <option> elements for languages drop down menu
export const generateLanguageOptions = () => {
  const languages = setUpLanguages();
  const elements = Object.keys(languages).map((langCode) => (
    <option key={`${langCode}}`} value={langCode}>
      {langCode.toUpperCase()} – {languages[langCode]}
    </option>
  ));
  return <>{elements}</>;
};

export const getLanguageFromCode = (_lang: string) => {
  const languages = setUpLanguages();
  let language = ""
  Object.keys(languages).map(l => {
    if (l.toLowerCase() === _lang.toLowerCase())
      language = languages[l]
  })

  return language
}

//Return <option> elemtns for ACADEMIC_FIELD data,
//params: ACADEMIC_FIELDS_BROAD, ACADEMIC_FIELDS_NARROW or ACADEMIC_FIELDS_DETAILS
const generateAcademicFields = (ACAD_FIELD_JSON_DATA: {
  [key: string]: string;
}) => {
  const acadFields: { [key: string]: string | { [key: string]: string } } =
    ACAD_FIELD_JSON_DATA;

  if (!acadFields)
    return (<></>)

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
export const generateAcadFieldsNarrow = (
  broadFieldCode: keyof typeof modelsIsced["NARROW_FIELDS"]
) => {
  return generateAcademicFields(modelsIsced.NARROW_FIELDS[broadFieldCode]);
};

//Return <option> elements for ACADEMIC_FIELDS_DETAILED
export const generateAcadFieldsDetailed = (
  narrowFieldCode: keyof typeof modelsIsced["DETAILED_FIELDS"]
) => {
  return generateAcademicFields(modelsIsced.DETAILED_FIELDS[narrowFieldCode]);
};

//Return <Form.Check/> (checkbox) elements for academic fields
export const generateAcademicFieldsCheckboxes = (
  eventHandler: (event: React.SyntheticEvent) => void
) => {
  const acadFields: { [key: string]: string } = models.ACADEMIC_FIELDS;
  // Process acadFields into categories

  const acadFieldsCheckboxes = Object.keys(acadFields).map((fieldCode) => (
    <input
      type="checkbox"
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

export const isValidForm = (
  form: IFormData,
  attachments: IUploadAttachment[],
  institution: IFormInstitution
) => {
  const messages: string[] = [];

  // requirements
  // title > 3 && title < 150
  if (form.title.length < 3 || form.title.length > 150) {
    messages.push(
      `The title should be between 3 and 150 characters (currently ${form.title.length})`
    );
  }

  // check description as well

  // language must comply
  if (form.language.length < 2) {
    messages.push(
      `The language should be BCP-47 compliant! (currently '${
        form.language.length > 0 ? form.language : "none"
      }')`
    );
  }

  // academic_level (come to think of it, this sounds abitrary, compared to not requiring academic_field)
  const ac_levels = ["0", "1", "2", "3"];
  if (!ac_levels.includes(form.academic_level.toString())) {
    messages.push(
      `Please choose an academic level: '${form.academic_level}'.)`
    );
  }

  // check that attachments are not null
  if (attachments.length > 0) {
    for (const att of attachments) {
      if (att.name.length < 3)
        messages.push(
          `Check attachments name: '${att.name}' (should be longer than 3 characters)`
        );
      if (att.url != "") {
        let u;
        try {
          u = new URL(att.url as string);

          if (att.file !== undefined)
            messages.push(
              `Can't have both URL and file attachment. Please create a separate attachment if you wish to upload both.`
            );
        } catch {
          messages.push(`Check that the attachment URL is valid: '${att.url}'`);
        }
      }

      if (att.file && att.file?.size > 16777216)
        // 16mb
        messages.push(
          `Check the size of '${att.file.name}' size: '${att.file.size}B' (Max: 16MB)`
        );
    }
  }

  if (institution.name === "")
    messages.push(`Please add the name of the institution.`);

  if (institution.country === "")
    messages.push(`Please add the country of the institution.`);

  if (institution.date_year === "")
    messages.push(`Please add the year of the institution.`)


  return { errors: messages }
}

export const submitForm = async (form: IFormData, endpoint: URL, method: string, h: Headers): Promise<Response> => {

  const arrayFields = ["readings", "tags", "academic_fields", "learning_outcomes", "topic_outlines", "assignments"]

  let body = new FormData();
  for (let [key, value] of Object.entries(form)) {
    if (arrayFields.includes(key)) {
      for (const t of value) {
        if (t !== "") {
          body.append(`${key}[]`, t as string)
        }
      }
    } else {
      body.append(key, value as string);
    }
  }

  const res = await fetch(endpoint, {
    method: method,
    headers: h,
    body: body,
  });

  return res
}

export const submitInstitution = (institution: IFormInstitution, endpoint: URL, method: string, h: Headers): Promise<Response> => {
  
  const i = new FormData();
  i.append("name", institution.name);
  i.append("url", institution.url);
  i.append("country", institution.country);
  i.append("date_year", institution.date_year);
  i.append("date_term", institution.date_term);

  const res = fetch(endpoint, {
    method: method,
    headers: h,
    body: i,
  });

  return res;
};

export const submitAttachments = (att: IUploadAttachment, endpoint: URL, method: string, h: Headers): Promise<Response> => {
  const a = new FormData();
  a.append("name", att.name);
  a.append("description", att.description ? att.description : "");
  a.append("file", att.file ? att.file : "");
  a.append("url", att.url ? att.url : ""); //-- otherwise it defaults to "undefined"

  const res = fetch(endpoint, {
    method: method,
    headers: h,
    body: a,
  });

  return res;
};
