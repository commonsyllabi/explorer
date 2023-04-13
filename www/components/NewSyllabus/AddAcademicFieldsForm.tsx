import React, { useState, useEffect } from "react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";

import { generateAcadFieldsBroad } from "components/utils/formUtils";

import AcadFieldsChildren from "./AcadFieldsChildren";
import modelsIsced from "models-isced.json"; //import tiered academic field codes

interface IAddAcademicFieldsFormProps {
  setAcadFieldsData: Function;
}

const AddAcademicFieldsForm: React.FunctionComponent<
  IAddAcademicFieldsFormProps
> = ({ setAcadFieldsData }) => {
  const [broadField, setBroadField] = useState("");
  const [narrowField, setNarrowField] = useState("");
  const [detailedField, setDetailedField] = useState("");

  // handle form changes
  const handleBroadFieldChange = (event: React.SyntheticEvent) => {
    const t = event.target as HTMLInputElement;
    // console.log(`${[t.id]}: ${t.value}`);
    setBroadField(t.value);
    setNarrowField("");
    setDetailedField("");
  };

  const handleNarrowFieldChange = (event: React.SyntheticEvent) => {
    const t = event.target as HTMLInputElement;
    // console.log(`${[t.id]}: ${t.value}`);
    setNarrowField(t.value);
    setDetailedField("");
  };

  const handleDetailedFieldChange = (event: React.SyntheticEvent) => {
    const t = event.target as HTMLInputElement;
    // console.log(`${[t.id]}: ${t.value}`);
    setDetailedField(t.value);
  };

  //TODO: capture broad, narrow and detailed states as array and set parent form.

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
  }, [broadField, narrowField, detailedField]);

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
          >
            <AcadFieldsChildren
              parentFieldCode={
                broadField as keyof typeof modelsIsced["NARROW_FIELDS"]
              }
              fieldLabel="Narrow"
            />
          </select>
        </div>

        <div className="w-full">
          <p className="small text-muted mb-0">DETAILED</p>
          <select
          className="bg-transparent mt-2 p-1 border-2 border-gray-900 w-full"
            id="academic_field_detailed"
            onChange={handleDetailedFieldChange}
          >
            <AcadFieldsChildren
              parentFieldCode={
                narrowField as keyof typeof modelsIsced["DETAILED_FIELDS"]
              }
              fieldLabel="Detailed"
            />
          </select>
        </div>
      </div>
      {/* <Button variant="secondary">Add another category</Button> */}
    </div>
  );
};

export default AddAcademicFieldsForm;
