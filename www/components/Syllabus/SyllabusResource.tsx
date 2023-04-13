import * as React from "react";
import Link from "next/link";

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
  const fileUrl = new URL(`static/${resourceUrl}`, process.env.NEXT_PUBLIC_API_URL)
  return (
    <div className="course-resource mb-4">
      <h3 className="font-bold">{resourceTitle}</h3>
      <div>
        <div className="flex">
          <div className="m-0 pe-2 text-gray-600">url:</div>
          <div className="m-0">
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

        {resourceDescription.length > 0 && (
          <div>
            <div className="pe-2 text-gray-600">description:</div>
            <div className="m-0">{resourceDescription}</div>
          </div>
        )}

        {resourceType.length > 0 && (
          <div>
            <div className="pe-2 text-gray-600">type:</div>
            <div className="m-0">{resourceType}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SyllabusResource;
