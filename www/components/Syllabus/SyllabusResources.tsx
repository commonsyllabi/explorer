import * as React from "react";

import { IResources, ISyllabus } from "types";

import SyllabusResource from "components/Syllabus/SyllabusResource";

interface ISyllabusResourcesProps {
  resources: IResources[];
  apiUrl: string;
}

const SyllabusResources: React.FunctionComponent<ISyllabusResourcesProps> = ({
  resources,
  apiUrl
}) => {
  if (resources.length < 1) {
    return <p className="muted">No resources to show.</p>;
  }
  const resourceEls = resources.map((resource) => (
    <SyllabusResource
      resourceTitle={resource.name}
      resourceUrl={resource.url}
      resourceDescription={resource.description}
      resourceType={resource.type}
      key={resource.uuid}
      apiUrl={apiUrl}
    />
  ));
  return <div className="syllabus-resources">{resourceEls}</div>;
};

export default SyllabusResources;
