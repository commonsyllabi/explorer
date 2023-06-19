import React, { useState, useEffect } from "react";

import { generateAcadFieldsBroad, generateAcadFieldsDetailed, generateAcadFieldsNarrow } from "components/utils/formUtils";

import AcadFieldsChildren from "./AcadFieldsChildren";
import modelsIsced from "models-isced.json"; //import tiered academic field codes
import { getSingleAcademicFieldText } from "components/utils/getAcademicFields";

interface IAddAcademicFieldsFormProps {
  setAcadFieldsData: Function;
  academicFields: string[]
}

// TODO: the way the values are being left-padded before retrieval doesn't scale
// write a helper function to do the conversion?

const AddAcademicFieldsForm: React.FunctionComponent<
  IAddAcademicFieldsFormProps
> = ({ setAcadFieldsData, academicFields }) => {
  const [broadField, setBroadField] = useState<string>("");
  const [narrowField, setNarrowField] = useState<string>("");
  const [detailedField, setDetailedField] = useState<string>("");

  useEffect(() => {
    if (academicFields) {
      setBroadField(academicFields.length > 0 ? academicFields[0].length == 1 ? `0${academicFields[0]}` : academicFields[0] : "")
      setNarrowField(academicFields.length > 1 ? academicFields[1] : "")
      setDetailedField(academicFields.length > 2 ? academicFields[2] : "")
    }
  }, [])

  const handleBroadFieldChange = (event: React.SyntheticEvent) => {
    const t = event.target as HTMLInputElement;
    setBroadField(t.value);
    setNarrowField("");
    setDetailedField("");
  };

  const handleNarrowFieldChange = (event: React.SyntheticEvent) => {
    const t = event.target as HTMLInputElement;
    setNarrowField(t.value);
    setDetailedField("");
  };

  const handleDetailedFieldChange = (event: React.SyntheticEvent) => {
    const t = event.target as HTMLInputElement;
    setDetailedField(t.value);
  };

  useEffect(() => {
    let acadFieldsArray = [];
    if (broadField != "") {
      acadFieldsArray.push(broadField);
    }
    if (narrowField != "") {
      acadFieldsArray.push(narrowField);
    }
    if (detailedField != "") {
      acadFieldsArray.push(detailedField);
    }

    setAcadFieldsData(acadFieldsArray);
  }, [broadField, narrowField, detailedField]);

  return (
    <div className="">
      <label htmlFor="academic_fields">
        Academic Field{" - "}
        <span className="text-xs">
          <em><a href="https://isced.uis.unesco.org/about/" className="underline" target="_blank" rel="noopener noreferrer">ISCED</a></em>
        </span>
      </label>
      <div
        className="flex flex-col md:flex-row items-baseline gap-2 mt-2"
        id="academicFieldsInputSection"
        data-cy="academicFieldsInputSection"
      >
        <div className="w-1/3">
          <select
            className="bg-transparent p-1 border-2 border-gray-900 w-full"
            id="academic_field_broad"
            value={broadField}
            onChange={handleBroadFieldChange}
            data-cy="academic-fields-broad"
          >
            <option value="">–</option>
            {generateAcadFieldsBroad()}
          </select>
          <p className="text-sm text-gray-800 mb-0">BROAD</p>
        </div>

        <div className="w-1/3">
          <select
            className="bg-transparent p-1 border-2 border-gray-900 w-full"
            id="academic_field_narrow"
            onChange={handleNarrowFieldChange}
            value={narrowField.length == 1 ? `00${narrowField}` : narrowField.length == 2 ? `0${narrowField}` : narrowField}
            data-cy="academic-fields-narrow"
          >
            <option value="">–</option>
            {generateAcadFieldsNarrow(
              broadField as keyof typeof modelsIsced["NARROW_FIELDS"]
            )}
          </select>
          <p className="text-sm text-gray-800 mb-0">NARROW</p>
        </div>

        <div className="w-1/3">
          <select
            className="bg-transparent p-1 border-2 border-gray-900 w-full"
            id="academic_field_detailed"
            onChange={handleDetailedFieldChange}
            value={detailedField.length == 1 ? `0${detailedField}` : detailedField.length == 2 ? `00${detailedField}` : detailedField}
            data-cy="academic-fields-detailed"
          >
            <option value="">–</option>
            {generateAcadFieldsDetailed(
              (narrowField.length == 1 ? `00${narrowField}` : narrowField.length == 2 ? `0${narrowField}` : narrowField) as keyof typeof modelsIsced["DETAILED_FIELDS"]
            )}
          </select>
          <p className="small text-gray-800 mb-0">DETAILED</p>
        </div>
      </div>
    </div>
  );
};

export default AddAcademicFieldsForm;
