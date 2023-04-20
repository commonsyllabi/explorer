import * as React from "react";

interface IPubBadgeProps {
  isPublic: boolean | null;
}

const PubBadge: React.FunctionComponent<IPubBadgeProps> = ({ isPublic }) => {
  if (isPublic === false) {
    return <div className="badge bg-secondary ms-2">Private</div>;
  } else if (isPublic === true) {
    return <div className="badge bg-success ms-2">Public</div>;
  } else {
    return null;
  }
};

export default PubBadge;
