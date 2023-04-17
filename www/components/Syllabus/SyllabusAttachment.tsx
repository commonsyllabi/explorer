import * as React from "react";
import Link from "next/link";

interface ISyllabusAttachmentProps {
  resourceTitle: string;
  resourceUrl: string;
  resourceDescription: string;
  resourceType: string;
}

const SyllabusAttachment: React.FunctionComponent<ISyllabusAttachmentProps> = ({
  resourceTitle,
  resourceUrl,
  resourceDescription,
  resourceType,
}) => {
  const fileUrl = new URL(`static/${resourceUrl}`, process.env.NEXT_PUBLIC_API_URL)
  return (
    <div className="course-resource my-6">
      <h3 className="font-bold">{resourceTitle}</h3>
      <div>
        <div className="flex">
          <div className="m-0 text-sm">
            {resourceType ? resourceType + ': ' : ''}
            {resourceType === "file" ? (
              <Link href={fileUrl} target="_blank" rel="noreferrer" className="underline">
                {resourceUrl}
              </Link>
            ) : (
              <Link href={resourceUrl} target="_blank" rel="noreferrer" className="underline">
                {resourceUrl}
              </Link>
            )}
          </div>
        </div>
        <div className="my-2">{resourceDescription}</div>
      </div>
    </div>
  );
};

export default SyllabusAttachment;
