import { ICollection } from "types";
import CollectionCard from "components/Collection/CollectionCard";

export const getCollectionCards = (
  collectionArray: ICollection[] | undefined,
  isAdmin?: boolean
) => {
  if (!collectionArray || collectionArray.length === 0) {
    return null;
  }

  const collectionCards = collectionArray.map((c) => (
    <CollectionCard
      key={c.uuid}
      collection={c}
      isAdmin={isAdmin ? isAdmin : false}
    />
  ));

  return <>{collectionCards}</>;
};
