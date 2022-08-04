import * as React from "react";

interface ISyllabusResourceProps {
  resourceTitle: string;
  resourceUrl: string;
  resourceDescription: string;
  resourceType: string;
}

const SyllabusResource: React.FunctionComponent<ISyllabusResourceProps> = ({
  resourceTitle,
  resourceUrl,
  resourceDescription,
  resourceType,
}) => {
  return (
    <div className="course-resource pe-3">
      <h3 className="h5">{resourceTitle}</h3>
      <dl>
        <div>
          <dt className="m-0 pe-2">url:</dt>
          <dd className="m-0">{resourceUrl}</dd>
        </div>
        <div>
          <dt className="pe-2">description:</dt>
          <dd className="m-0">{resourceDescription}</dd>
        </div>
        <div>
          <dt className="pe-2">type:</dt>
          <dd className="m-0">{resourceType}</dd>
        </div>
      </dl>
    </div>
  );
};

export default SyllabusResource;
