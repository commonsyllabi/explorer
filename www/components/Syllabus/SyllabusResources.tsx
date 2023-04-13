import * as React from "react";

import { IResources, ISyllabus } from "types";

import SyllabusResource from "components/Syllabus/SyllabusResource";
import { kurintoSerif } from "app/layout";

interface ISyllabusResourcesProps {
  resources?: IResources[];
}

const SyllabusResources: React.FunctionComponent<ISyllabusResourcesProps> = ({
  resources,
}) => {
  if (resources === undefined || resources.length < 1) {
    return <p className="text-gray-600">No resources to show.</p>;
  }
  const resourceEls = resources.map((resource) => (
    <SyllabusResource
      resourceTitle={resource.name}
      resourceUrl={resource.url}
      resourceDescription={resource.description}
      resourceType={resource.type}
      key={resource.uuid}
    />
  ));
  return <div className="syllabus-resources">
    <h2 className={`${kurintoSerif.className} text-lg mb-2`}>Course Resources</h2>
    <div>
      {resourceEls}
    </div>
  </div>;
};

export default SyllabusResources;
