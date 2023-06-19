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
  const fileUrl = process.env.NODE_ENV === "production" ?
    new URL(`uploads/${resourceUrl}`, process.env.NEXT_PUBLIC_STORAGE_URL) : new URL(`static/${resourceUrl}`, process.env.NEXT_PUBLIC_API_URL)

  return (
    <div className="w-full p-3 gap-4 border border-gray-800 rounded-lg">
      <h3 data-cy="course-attachment-title" className="font-bold">{resourceTitle}</h3>
      <div>
        <div className="flex">
          <div className="m-0 text-sm">
            {resourceType ? resourceType + ': ' : ''}
            {resourceType === "file" ? (
              <Link href={fileUrl} target="_blank" rel="noreferrer" className="underline">
                {resourceUrl}
              </Link>
            ) : (
              <Link data-cy="course-attachment-url" href={resourceUrl} target="_blank" rel="noreferrer" className="underline">
                {resourceUrl}
              </Link>
            )}
          </div>
        </div>
        <div data-cy="course-attachment-description" className="my-2 text-sm">{resourceDescription}</div>
      </div>
    </div>
  );
};

export default SyllabusAttachment;
