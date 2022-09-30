import * as React from "react";

import {
  generateAcadFieldsNarrow,
  generateAcadFieldsDetailed,
} from "components/utils/formUtils";
import modelsIsced from "models-isced.json"; //import tiered academic field codes


interface IAcadFieldsChildrenProps {
  narrowFieldCode?: keyof typeof modelsIsced['NARROW_FIELDS'] | undefined;
  detailedFieldCode?: keyof typeof modelsIsced['DETAILED_FIELDS'] | undefined;
  fieldLabel: string;
}

const AcadFieldsChildren: React.FunctionComponent<IAcadFieldsChildrenProps> = ({
  narrowFieldCode,
  detailedFieldCode,
  fieldLabel,
}) => {
  if (narrowFieldCode === undefined || narrowFieldCode.length === 0 || detailedFieldCode === undefined || detailedFieldCode.length === 0) {
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
          {generateAcadFieldsNarrow(narrowFieldCode)}
        </>
      );
    } else {
      return (
        <>
          <option value="">–</option>
          {generateAcadFieldsDetailed(detailedFieldCode)}
        </>
      );
    }
  }
};

export default AcadFieldsChildren;
