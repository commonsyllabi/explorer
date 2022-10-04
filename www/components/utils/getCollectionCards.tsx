import { ICollection } from "types";
import CollectionCard from "components/CollectionCard";

export const getCollectionCards = (
  collectionArray: ICollection[] | undefined,
  userName?: string,
  isAdmin?: boolean
) => {
  if (!collectionArray || collectionArray.length === 0) {
    return null;
  }

  const collectionCards = collectionArray.map((item) => (
    <CollectionCard
      key={item.uuid}
      userName={userName ? userName : "Netochka Nezvanova"}
      uuid={item.uuid}
      name={item.name}
      status={item.status}
      description={item.description}
      tags={item.tags}
      userUuid={item.user_uuid}
      syllabiCount={item.syllabi ? item.syllabi.length : 0}
      isAdmin={isAdmin ? isAdmin : false}
    />
  ));

  return <div className="d-flex flex-column gap-3">{collectionCards}</div>;
};
