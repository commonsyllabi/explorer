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
    <Form.Group className="mb-5">
      <Form.Label htmlFor="academic_fields">
        Academic Field{" "}
        <p className="small text-muted mb-1">
          <em>ISCED Fields of Education and Training</em>
        </p>
      </Form.Label>
      <div
        className="flex gap-2 mb-3"
        id="academicFieldsInputSection"
        data-cy="academicFieldsInputSection"
      >
        <div className="col-4">
          <p className="small text-muted mb-0">BROAD</p>
          <Form.Select
            id="academic_field_broad"
            onChange={handleBroadFieldChange}
          >
            <option value="">–</option>
            {generateAcadFieldsBroad()}
          </Form.Select>
        </div>

        <div className="col-4">
          <p className="small text-muted mb-0">NARROW</p>
          <Form.Select
            id="academic_field_narrow"
            onChange={handleNarrowFieldChange}
          >
            <AcadFieldsChildren
              parentFieldCode={
                broadField as keyof typeof modelsIsced["NARROW_FIELDS"]
              }
              fieldLabel="Narrow"
            />
          </Form.Select>
        </div>

        <div className="col-4">
          <p className="small text-muted mb-0">DETAILED</p>
          <Form.Select
            id="academic_field_detailed"
            onChange={handleDetailedFieldChange}
          >
            <AcadFieldsChildren
              parentFieldCode={
                narrowField as keyof typeof modelsIsced["DETAILED_FIELDS"]
              }
              fieldLabel="Detailed"
            />
          </Form.Select>
        </div>
      </div>
      {/* <Button variant="secondary">Add another category</Button> */}
    </Form.Group>
  );
};

export default AddAcademicFieldsForm;
