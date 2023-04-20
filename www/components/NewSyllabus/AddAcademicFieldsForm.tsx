import React, { useState, useEffect } from "react";

import { generateAcadFieldsBroad, generateAcadFieldsDetailed, generateAcadFieldsNarrow } from "components/utils/formUtils";

import AcadFieldsChildren from "./AcadFieldsChildren";
import modelsIsced from "models-isced.json"; //import tiered academic field codes
import { getSingleAcademicFieldText } from "components/utils/getAcademicFields";

interface IAddAcademicFieldsFormProps {
  setAcadFieldsData: Function;
  academicFields: string[]
}

const AddAcademicFieldsForm: React.FunctionComponent<
  IAddAcademicFieldsFormProps
> = ({ setAcadFieldsData, academicFields }) => {

  const [broadField, setBroadField] = useState(academicFields.length > 0 ? academicFields[0].length == 1 ? `0${academicFields[0]}` : academicFields[0] : "");
  const [narrowField, setNarrowField] = useState(academicFields.length > 1 ? academicFields[1] : "");
  const [detailedField, setDetailedField] = useState(academicFields.length > 2 ? academicFields[2] : "");

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
    if (broadField.length > 0) {
      acadFieldsArray.push(broadField);
    }
    if (narrowField.length > 0) {
      acadFieldsArray.push(narrowField);
    }
    if (detailedField.length > 0) {
      acadFieldsArray.push(detailedField);
    }

    setAcadFieldsData(acadFieldsArray);
  }, [broadField, narrowField, detailedField, setAcadFieldsData]);

  return (
    <div className="mb-5">
      <label htmlFor="academic_fields">
        Academic Field{" "}
        <p className="text-sm text-muted mb-1">
          <em>ISCED Fields of Education and Training</em>
        </p>
      </label>
      <div
        className="flex flex-col md:flex-row w-full gap-2 mb-3"
        id="academicFieldsInputSection"
        data-cy="academicFieldsInputSection"
      >
        <div className="w-full">
          <p className="text-sm text-muted mb-0">BROAD</p>
          <select
            className="bg-transparent mt-2 p-1 border-2 border-gray-900 w-full"
            id="academic_field_broad"
            value={broadField}
            onChange={handleBroadFieldChange}
          >
            <option value="">–</option>
            {generateAcadFieldsBroad()}
          </select>
        </div>

        <div className="w-full">
          <p className="text-sm text-muted mb-0">NARROW</p>
          <select
            className="bg-transparent mt-2 p-1 border-2 border-gray-900 w-full"
            id="academic_field_narrow"
            onChange={handleNarrowFieldChange}
            value={narrowField}
          >
            <option value="">–</option>
            {generateAcadFieldsNarrow(
              broadField as keyof typeof modelsIsced["NARROW_FIELDS"]
            )}
          </select>
        </div>

        <div className="w-full">
          <p className="small text-muted mb-0">DETAILED</p>
          <select
            className="bg-transparent mt-2 p-1 border-2 border-gray-900 w-full"
            id="academic_field_detailed"
            onChange={handleDetailedFieldChange}
            value={detailedField}
          >
            <option value="">–</option>
            {generateAcadFieldsDetailed(
              narrowField as keyof typeof modelsIsced["DETAILED_FIELDS"]
            )}
          </select>
        </div>
      </div>
    </div>
  );
};

export default AddAcademicFieldsForm;
