import * as React from "react";

import {
  generateAcadFieldsNarrow,
  generateAcadFieldsDetailed,
} from "components/utils/formUtils";

import modelsIsced from "models-isced.json"; //import tiered academic field codes

interface IAcadFieldsChildrenProps {
  parentFieldCode?: string | undefined;
  fieldLabel: string;
}

const AcadFieldsChildren: React.FunctionComponent<IAcadFieldsChildrenProps> = ({
  parentFieldCode,
  fieldLabel,
}) => {
  if (parentFieldCode === undefined || parentFieldCode.length === 0) {
    return (
      <>
        <option value="">–</option>
      </>
    );
  } else {
    if (fieldLabel.toLocaleUpperCase() === "NARROW") {
      return (
        <>
          <option value="">–</option>
          {generateAcadFieldsNarrow(
            parentFieldCode as keyof typeof modelsIsced["NARROW_FIELDS"]
          )}
        </>
      );
    } else {
      return (
        <>
          <option value="">–</option>
          {generateAcadFieldsDetailed(
            parentFieldCode as keyof typeof modelsIsced["DETAILED_FIELDS"]
          )}
        </>
      );
    }
  }
};

export default AcadFieldsChildren;
