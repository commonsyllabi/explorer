import { ICollection } from "types";
import CollectionCard from "components/Collection/CollectionCard";

export const getCollectionCards = (
  collectionArray: ICollection[] | undefined,
) => {
  if (!collectionArray || collectionArray.length === 0) {
    return null;
  }

  const collectionCards = collectionArray.map((c) => (
    <CollectionCard
      key={c.uuid}
      collection={c}
    />
  ));

  return collectionCards;
};
