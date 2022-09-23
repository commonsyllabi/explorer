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
      <h3 className="h5">{resourceTitle}</h3>
      <dl>
        <div>
          <dt className="m-0 pe-2">url:</dt>
          <dd className="m-0">
            {resourceType === "file" ? (
              <Link href={fileUrl}>
                <a target="_blank" rel="noreferrer">
                  {resourceUrl}
                </a>
              </Link>
            ) : (
              <Link href={resourceUrl}>
                <a target="_blank" rel="noreferrer">
                  {resourceUrl}
                </a>
              </Link>
            )}
          </dd>
        </div>

        {resourceDescription.length > 0 && (
          <div>
            <dt className="pe-2">description:</dt>
            <dd className="m-0">{resourceDescription}</dd>
          </div>
        )}

        {resourceType.length > 0 && (
          <div>
            <dt className="pe-2">type:</dt>
            <dd className="m-0">{resourceType}</dd>
          </div>
        )}
      </dl>
    </div>
  );
};

export default SyllabusResource;
