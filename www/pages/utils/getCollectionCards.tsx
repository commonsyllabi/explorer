import { ICollection } from "types";
import CollectionCard from "components/CollectionCard";

export const getCollectionCards = (
  collectionArray: ICollection[] | undefined,
  userName: string,
  userUuid: string
) => {
  if (!collectionArray || collectionArray.length === 0) {
    return null;
  }

  const collectionCards = collectionArray.map((item) => (
    <CollectionCard
      key={item.uuid}
      uuid={item.uuid}
      name={item.name}
      status={item.status}
      description={item.description}
      tags={item.tags}
      userName={userName}
      userUuid={userUuid}
      syllabiCount={item.syllabi ? item.syllabi.length : 0}
    />
  ));

  return <div className="d-flex flex-column gap-3">{collectionCards}</div>;
};
