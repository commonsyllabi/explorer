import * as React from "react";

import {
  generateAcadFieldsNarrow,
  generateAcadFieldsDetailed,
} from "components/utils/formUtils";

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
          {generateAcadFieldsNarrow(parentFieldCode)}
        </>
      );
    } else {
      return (
        <>
          <option value="">–</option>
          {generateAcadFieldsDetailed(parentFieldCode)}
        </>
      );
    }
  }
};

export default AcadFieldsChildren;
