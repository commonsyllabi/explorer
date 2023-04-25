import type { GetServerSideProps, GetServerSidePropsContext, NextPage } from "next";
import Image from "next/image";

import { ICollection } from "types";
import BreadcrumbsBar from "components/commons/BreadcrumbsBar";

import NotFound from "components/commons/NotFound";
import { signOut, useSession } from "next-auth/react";
import React, { useEffect, useState } from "react";
import Router from "next/router";
import Link from "next/link";
import { getToken } from "next-auth/jwt";

import deleteIcon from '../../public/icons/delete-bin-line.svg'
import { Session } from "next-auth";
import CollectionInfo from "components/Collection/CollectionInfo";
import CollectionItem from "components/Collection/CollectionItem";
import { EditContext } from "context/EditContext";

export const getServerSideProps: GetServerSideProps = async (context: GetServerSidePropsContext) => {
  const collectionId = context.params!.cid;

  const t = await getToken({ req: context.req, secret: process.env.NEXTAUTH_SECRET })
  const token = t ? (t.user as { _id: string, token: string }).token : '';
  const url = new URL(`collections/${collectionId}`, process.env.NEXT_PUBLIC_API_URL);

  const h = new Headers();
  if (t)
    h.append("Authorization", `Bearer ${token}`);

  const res = await fetch(url, { headers: h });
  if (res.ok) {
    const collectionInfo = await res.json();
    return {
      props: { collectionInfo: collectionInfo },
    };
  } else {
    return {
      props: {},
    };
  }
};

interface ICollectionPageProps {
  collectionInfo: ICollection
}

const Collection: NextPage<ICollectionPageProps> = ({ collectionInfo }) => {

  const { data: session, status } = useSession();
  const [log, setLog] = useState('')
  const [isOwner, setIsOwner] = useState(false)
  const [endpoint, setEndpoint] = useState<URL>()
  const confirmMsg = `Do you really want to delete the collection ${collectionInfo.name}? This action cannot be undone.`;

  const checkIfOwner = (_session: Session, _uuid: string) => {
    if (_session.user != null) {
      return _session.user._id === _uuid;
    }
    return false
  };

  useEffect(() => {
    if (!collectionInfo || !session) return
    const o = checkIfOwner(session, collectionInfo.user_uuid)
    setIsOwner(o)
    setEndpoint(new URL(`/collections/${collectionInfo.uuid}`, process.env.NEXT_PUBLIC_API_URL))
  }, [session, collectionInfo])

  const submitDelete = () => {
    if (!endpoint) return;
    if (!window.confirm(confirmMsg))
      return

    const h = new Headers();
    h.append("Authorization", `Bearer ${session?.user.token}`);

    fetch(endpoint, {
      method: 'DELETE',
      headers: h,
    })
      .then((res) => {
        if (res.ok) {
          Router.push("/");
        } else if (res.status == 401) {
          signOut({ redirect: false }).then((result) => {
            Router.push("/auth/signin");
          })
          return res.text()
        } else {
          return res.text()
        }
      })
      .then(body => {
        setLog(`An error occured while deleting: ${body}`)
      })
  }

  if (!collectionInfo)
    return (
      <NotFound />
    )

  return (
    <>
      <div className="w-11/12 md:w-10/12 m-auto mt-8">
        <BreadcrumbsBar
          user={collectionInfo.user.name}
          userId={collectionInfo.user_uuid}
          category="collections"
          pageTitle={collectionInfo.name}
        />
        <EditContext.Provider value={{ isOwner: isOwner, collectionUUID: collectionInfo.uuid }}>
          <CollectionInfo collectionInfo={collectionInfo} />
          <div className="gap-3 pb-5">{
            collectionInfo.syllabi ?
              collectionInfo.syllabi.map(s => {
                return <CollectionItem syllabusInfo={s} key={`coll-item-${s.uuid}`} />
              })
              :
              <div data-cy="no-collection-items">
                <div>There are no syllabi in this collection.</div>

                {isOwner ?
                  <div className="mt-8">
                    <Link href="/" className="underline">Browse syllabi</Link> to add them to your collection.
                  </div> : <></>}
              </div>
          }</div>
        </EditContext.Provider>

        {isOwner ?
          <>
            <button data-cy="delete-button" onClick={submitDelete} className="flex p-2 bg-red-400 hover:bg-red-500 text-white rounded-md gap-3" >
              <Image src={deleteIcon} width="24" height="24" alt="Icon to delete the syllabus" />
              <div>Delete</div>
            </button>
            <div>{log}</div>
          </>
          :
          <></>}
      </div>
    </>
  );
};

export default Collection;
