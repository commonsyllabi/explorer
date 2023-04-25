import * as React from "react";

import type { GetServerSideProps, NextPage } from "next";
import { getCollectionCards } from "../../components/utils/getCollectionCards";

import { ICollection } from "types";
import { kurintoSerif } from "app/layout";

interface ICollectionsProps {
  collectionsListings: ICollection[];
}

export const getServerSideProps: GetServerSideProps = async () => {
  const url = new URL("collections/", process.env.NEXT_PUBLIC_API_URL);

  const res = (await fetch(url).catch((err) => {
    return {
      props: {
        collectionsListings: [],
      },
    };
  })) as Response;

  if (!res.ok) {
    return {
      props: {
        collectionsListings: [],
      },
    };
  } else {
  }
  const collectionsListings = await res.json();

  return {
    props: {
      collectionsListings: collectionsListings,
    },
  };
};

const Collections: React.FunctionComponent<ICollectionsProps> = ({
  collectionsListings,
}) => {
  return (
      <div className="w-11/12 md:w-10/12 m-auto mt-5">
        <h1 className={`${kurintoSerif.className} text-3xl p-0 my-8`}>Public Collections</h1>
          <div className="flex flex-row gap-3">
            {getCollectionCards(collectionsListings)}
          </div>
      </div>
  );
};

export default Collections;
