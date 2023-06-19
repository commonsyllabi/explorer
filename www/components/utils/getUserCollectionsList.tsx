import { ICollection } from "types";

import { getCollectioniUrl } from "components/utils/getLinks";

const getCollectionList = (
  collectionArray: ICollection[] | undefined,
  filterPrivate: boolean
) => {
  let collectionList = [];
  if (collectionArray) {
    for (let i = 0; i < collectionArray.length; i++) {
      if (filterPrivate) {
        if (collectionArray[i].status === "unlisted") {
          let collection = {
            uuid: collectionArray[i].uuid,
            url: getCollectioniUrl(collectionArray[i].uuid),
            title: collectionArray[i].name,
          };
          collectionList.push(collection);
        }
      } else {
        if (collectionArray[i].status === "listed") {
          let collection = {
            uuid: collectionArray[i].uuid,
            url: getCollectioniUrl(collectionArray[i].uuid),
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
