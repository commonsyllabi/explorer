import Link from "next/link";
import PubBadge from "../commons/PubBadge";
import { getIsPublic } from "components/utils/getIsPublic";
import Tags from "../Syllabus/Tags";
import { getUserUrl } from "../utils/getLinks";
import { ICollection } from "types";
import { EditContext } from "context/EditContext";
import { useContext } from "react";

interface ICollectionCardProps {
  collection: ICollection
}

const CollectionCard: React.FunctionComponent<ICollectionCardProps> = (
  { collection }
) => {
  const ctx = useContext(EditContext)
  return (
    <div data-cy="syllabusCard" className="border-2 border-gray-600 rounded-lg p-3">
      <div>
        <div className="flex justify-between w-full mt-2 mb-2">
          <Link href={`/collections/${collection.uuid}`} className="text-xl font-bold hover:underline">
            {collection.name}
          </Link>
          {ctx.isOwner ? (
            <PubBadge isPublic={getIsPublic(collection.status)} />
          ) : null}
        </div>
        <p className="collection-meta text-sm">
          collection by{" "}
          <Link href={getUserUrl(collection.user_uuid)} className="underline">{collection.user.name}</Link> |
          contains {`${collection.syllabi.length === 1 ? '1 syllabus' : collection.syllabi.length + ' syllabi'} `}
        </p>
        <div className="collection-description">
          {collection.description}
        </div>
        <Tags tags={collection.tags} />
      </div>
    </div>
  );
};

export default CollectionCard;
