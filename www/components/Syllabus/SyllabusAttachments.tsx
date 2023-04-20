import * as React from "react";

import { IAttachment, ISyllabus } from "types";

import SyllabusAttachment from "components/Syllabus/SyllabusAttachment";
import { kurintoSerif } from "app/layout";

interface ISyllabusAttachmentsProps {
  attachments?: IAttachment[];
}

const SyllabusAttachments: React.FunctionComponent<ISyllabusAttachmentsProps> = ({
  attachments,
}) => {
  if (attachments === undefined || attachments.length < 1) {
    return <p className="text-gray-600">No attachments to show.</p>;
  }
  const resourceEls = attachments.map((att) => (
    <SyllabusAttachment
      resourceTitle={att.name}
      resourceUrl={att.url ? att.url : ""}
      resourceDescription={att.description ? att.description : ""}
      resourceType={att.type}
      key={att.uuid}
    />
  ));
  return <div className="syllabus-resources">
    <h2 className={`${kurintoSerif.className} text-lg mb-2`}>Course Resources</h2>
    <div>
      {resourceEls}
    </div>
  </div>;
};

export default SyllabusAttachments;
