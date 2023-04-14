import * as React from "react";

interface IPubBadgeProps {
  isPublic: boolean | null;
}

const PubBadge: React.FunctionComponent<IPubBadgeProps> = ({ isPublic }) => {
  if (isPublic === false) {
    return <span className="badge bg-secondary ms-2">Private</span>;
  } else if (isPublic === true) {
    return <span className="badge bg-success ms-2">Public</span>;
  } else {
    return null;
  }
};

export default PubBadge;
