import * as React from "react";
import Link from "next/link";
import PubBadge from "./PubBadge";
import { getIsPublic } from "components/utils/getIsPublic";
import Tags from "./Tags";
import { getUserUrl } from "./utils/getLinks";

interface ICollectionCardProps {
  uuid: string;
  name: string;
  status: string;
  description?: string;
  tags?: string[];
  userName: string;
  userUuid: string;
  syllabiCount?: number;
  isAdmin: boolean;
}

const CollectionCard: React.FunctionComponent<ICollectionCardProps> = (
  props
) => {
  return (
    <div data-cy="syllabusCard" className="border-2 border-gray-600 rounded-lg p-3">
      <div>
        <div className="flex justify-between w-full mt-2 mb-2">
          <Link href={`/collections/${props.uuid}`} className="text-xl font-bold hover:underline">
            {props.name}
          </Link>
          {props.isAdmin ? (
            <PubBadge isPublic={getIsPublic(props.status)} />
          ) : null}
        </div>
        <p className="collection-meta text-sm">
          collection by{" "}
          <Link href={getUserUrl(props.userUuid)} className="underline">{props.userName}</Link> |
          contains {props.syllabiCount} syllabi
        </p>
        <div className="course-description">
          {props.description}
        </div>
        <Tags tags={props.tags} />
      </div>
    </div>
  );
};

export default CollectionCard;
