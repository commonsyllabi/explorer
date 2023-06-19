import * as React from "react";

interface IPubBadgeProps {
  isPublic: boolean | null;
}

const PubBadge: React.FunctionComponent<IPubBadgeProps> = ({ isPublic }) => {
  if (isPublic === false) {
    return <div className="rounded-md w-max p-1 text-gray-400">Private</div>;
  } else if (isPublic === true) {
    return <div className="rounded-md w-max p-1 bg-gray-200">Public</div>;
  } else {
    return null;
  }
};

export default PubBadge;
