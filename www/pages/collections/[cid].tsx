import type { GetServerSideProps, GetServerSidePropsContext, NextPage } from "next";
import Image from "next/image";

import { IUser, ISyllabus, ICollection } from "types";
import BreadcrumbsBar from "components/commons/BreadcrumbsBar";

import { getSyllabusCards } from "components/utils/getSyllabusCards";
import NotFound from "components/commons/NotFound";
import { signOut, useSession } from "next-auth/react";
import React, { useEffect, useState } from "react";
import Router from "next/router";
import Link from "next/link";
import { getToken } from "next-auth/jwt";
import { kurintoBook } from "app/layout";
import editIcon from '../../public/icons/edit-box-line.svg'
import cancelIcon from '../../public/icons/close-line.svg'
import checkIcon from '../../public/icons/check-line.svg'
import deleteIcon from '../../public/icons/delete-bin-line.svg'
import removeIcon from '../../public/icons/subtract-line.svg'
import { Session } from "next-auth";

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
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('')
  const [tmp, setTmp] = useState('')
  const [log, setLog] = useState('')
  const [isOwner, setIsOwner] = useState(false)
  const [isShowingTooltip, setShowTooltip] = useState(false)
  const [endpoint, setEndpoint] = useState<URL>()

  const checkIfOwner = (_session: Session, _uuid: string) => {
    if (_session.user != null) {
      return _session.user._id === _uuid;
    }
    return false
  };

  useEffect(() => {
    if (!collectionInfo || !session) return
    const o = checkIfOwner(session, collectionInfo.user_uuid)
    setName(collectionInfo.name)
    setTmp(collectionInfo.name)
    setEndpoint(new URL(`/collections/${collectionInfo.uuid}`, process.env.NEXT_PUBLIC_API_URL))

    setIsOwner(o)
  }, [session, collectionInfo])

  const confirmMsg = `Do you really want to delete the collection ${name}? This action cannot be undone.`;
  const confirmRemoveMsg = `Do you really want to remove this syllabus from ${name}? This action cannot be undone.`

  const default_filters = {
    academic_level: "",
    academic_field: "",
    academic_year: "",
    language: "",
    tags_include: [],
    tags_exclude: [],
  }

  const submitEdit = () => {
    if (!endpoint) return;

    const h = new Headers();
    h.append("Authorization", `Bearer ${session?.user.token}`);

    let b = new FormData()
    if (tmp.length < 1) {
      setLog("Name must be at least 1 character long")
      return;
    }
    b.append("name", tmp)

    fetch(endpoint, {
      method: 'PATCH',
      headers: h,
      body: b
    })
      .then((res) => {
        if (res.ok) {
          setIsEditing(false)
          setName(tmp)
          setLog('')
          return;
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
        setLog(`An error occured while saving: ${body}`)
      })
  }

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

  const handleChange = (e: React.BaseSyntheticEvent) => {
    e.preventDefault()
    setTmp(e.target.value)
  }

  const handleRemove = (e: React.BaseSyntheticEvent) => {
    e.preventDefault()
    const t = e.target;
    const removeUrl = new URL(`/collections/${collectionInfo.uuid}/syllabi/${t.dataset.syllabusid}`, process.env.NEXT_PUBLIC_API_URL)

    if (!window.confirm(confirmRemoveMsg))
      return

    const h = new Headers();
    h.append("Authorization", `Bearer ${session?.user.token}`);

    fetch(removeUrl, {
      method: 'DELETE',
      headers: h,
    })
      .then((res) => {
        if (res.ok) {
          Router.reload();
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
        <div className="flex flex-col gap-2 my-6">
          {isEditing ?
            <div className="w-full md:w-2/3">
              <input data-cy="edit-collection-name" value={tmp} defaultValue={name} onChange={handleChange} className={`${kurintoBook.className} w-full text-2xl bg-transparent mt-2 py-1 border-b-2 border-b-gray-900`}></input>
              <div className="py-1 mt-2 flex flex-col lg:flex-row gap-2 justify-between">
                <button data-cy="cancel-button" className="flex items-center gap-2 rounded-lg border border-1 border-gray-900 py-1 px-2 bg-red-100 hover:bg-red-300" onClick={() => { setIsEditing(false); }}>
                  <Image src={cancelIcon} width="24" height="24" alt="Icon to cancel the edit process" />
                  <div>Cancel</div>
                </button>
                <button data-cy="save-button" className="flex items-center gap-2 rounded-lg border border-1 border-gray-900 py-1 px-2" onClick={submitEdit}>
                  <Image src={checkIcon} width="24" height="24" alt="Icon to save the edit process" />
                  <div>Save</div>
                </button>
              </div>
              <div>{log}</div>
            </div>
            : isOwner ?
              <>
                <h1 data-cy="collection-name" className={`${kurintoBook.className} text-3xl`}>{name}</h1>
                <div className="flex gap-3">
                  <button className={`flex gap-2 opacity-70 border ${isShowingTooltip ? '' : 'opacity-40'} rounded-md border-gray-700 w-max p-1`} onClick={() => setIsEditing(true)} data-cy="edit-button" onMouseEnter={() => { setShowTooltip(true) }} onMouseLeave={() => { setShowTooltip(false) }}>
                    <Image src={editIcon} width="22" height="22" alt="Icon to edit the list" />
                    <div className={`${isShowingTooltip ? '' : 'hidden'} text-sm`}>Edit</div>
                  </button>
                </div>
              </>

              :
              <h1 className={`${kurintoBook.className} text-3xl`}>{collectionInfo.name}</h1>
          }

        </div>
        <div className="gap-3 pb-5">{
          collectionInfo.syllabi ?
            collectionInfo.syllabi.map(s => {
              return <div key={s.uuid} className="flex gap-1">
                {getSyllabusCards([s], default_filters)}
                <div className="border-2 border-gray-900 p-2 rounded-md flex items-center">
                  <button data-syllabusid={s.uuid} onClick={handleRemove}>
                    <Image src={removeIcon} width="24" height="24" alt="Icon to remove an element from the list" />
                  </button>
                </div>
              </div>

            })
            :
            <div>
              <div>There are no syllabi in this collection.</div>
              {isOwner ? <div className="mt-8"><Link href="/" className="underline">Browse syllabi</Link> to add them to your collection.</div> : <></>}
            </div>
        }</div>
        {isOwner ?
          <button data-cy="delete-button" onClick={submitDelete} className="flex p-2 bg-red-400 hover:bg-red-500 text-white rounded-md gap-3" >
            <Image src={deleteIcon} width="24" height="24" alt="Icon to delete the syllabus" />
            <div>Delete</div>
          </button>
          :
          <></>}
      </div>
    </>
  );
};

export default Collection;
