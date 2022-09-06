import { ICollection } from "types";

const getCollectionList = (
  collectionArray: ICollection[] | undefined,
  filterPrivate: boolean
) => {
  let collectionList = [];
  const apiUrl = process.env.API_URL;
  if (collectionArray) {
    for (let i = 0; i < collectionArray.length; i++) {
      if (filterPrivate) {
        if (collectionArray[i].status === "unlisted") {
          let collection = {
            uuid: collectionArray[i].uuid,
            url: "/collection/" + collectionArray[i].uuid,
            title: collectionArray[i].name,
          };
          collectionList.push(collection);
        }
      } else {
        if (collectionArray[i].status === "listed") {
          let collection = {
            uuid: collectionArray[i].uuid,
            url: "/collection/" + collectionArray[i].uuid,
            title: collectionArray[i].name,
          };
          collectionList.push(collection);
        }
      }
    }
  }
  return collectionList;
};

export const getPrivateCollectionList = (
  CollectionArray: ICollection[] | undefined
) => {
  return getCollectionList(CollectionArray, true);
};

export const getPublicCollectionList = (
  CollectionArray: ICollection[] | undefined
) => {
  return getCollectionList(CollectionArray, false);
};
