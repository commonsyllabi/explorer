import type { GetServerSideProps, GetServerSidePropsContext, NextPage } from "next";
import Image from "next/image";

import { IUser, ISyllabus } from "types";
import BreadcrumbsBar from "components/commons/BreadcrumbsBar";

import { getSyllabusCards } from "components/utils/getSyllabusCards";
import NotFound from "components/commons/NotFound";
import { signOut, useSession } from "next-auth/react";
import React, { useState } from "react";
import Router from "next/router";
import { getToken } from "next-auth/jwt";
import { kurintoBook } from "app/layout";
import editIcon from '../../public/icons/edit-box-line.svg'
import cancelIcon from '../../public/icons/close-line.svg'
import checkIcon from '../../public/icons/check-line.svg'
import deleteIcon from '../../public/icons/delete-bin-line.svg'
import Link from "next/link";
import removeIcon from '../../public/icons/subtract-line.svg'

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
      props: collectionInfo,
    };
  } else {
    return {
      props: {},
    };
  }
};

interface ICollectionProps {
  uuid: string;
  status: string;
  name: string;
  description: string;
  syllabi: ISyllabus[];
  user_uuid: string;
  user: IUser;
}

const Collection: NextPage<ICollectionProps> = (props) => {

  const { data: session, status } = useSession();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(props.name || '')
  const [tmp, setTmp] = useState(props.name || '')
  const [log, setLog] = useState('')
  const url = new URL(`/collections/${props.uuid}`, process.env.NEXT_PUBLIC_API_URL)
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

  if (Object.keys(props).length === 0) {
    return (
      <NotFound />
    )
  }

  const checkIfAdmin = () => {
    if (session != null && session.user != null) {
      return session.user._id === props.user_uuid;
    }
    return false
  };

  const submitEdit = () => {
    const h = new Headers();
    h.append("Authorization", `Bearer ${session?.user.token}`);

    let b = new FormData()
    b.append("name", tmp)

    fetch(url, {
      method: 'PATCH',
      headers: h,
      body: b
    })
      .then((res) => {
        if (res.ok) {
          setIsEditing(false)
          setName(tmp)
          setLog('')
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
    if (!window.confirm(confirmMsg))
      return

    const h = new Headers();
    h.append("Authorization", `Bearer ${session?.user.token}`);

    fetch(url, {
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
    const removeUrl = new URL(`/collections/${props.uuid}/syllabi/${t.dataset.syllabusid}`, process.env.NEXT_PUBLIC_API_URL)

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

  return (
    <>
      <div className="w-11/12 md:w-10/12 m-auto mt-8">
        <BreadcrumbsBar
          user={props.user.name}
          userId={props.user_uuid}
          category="collections"
          pageTitle={props.name}
        />
        <div className="flex flex-col gap-2 my-6">
          {isEditing ?
            <>
              <input value={tmp} defaultValue={name} onChange={handleChange} className={`${kurintoBook.className} text-2xl w-8/12 bg-transparent mt-2 py-1 border-b-2 border-b-gray-900`}></input>
              <div className="flex gap-3">
                <button className="w-6" onClick={() => { setIsEditing(false); }}>
                  <Image src={cancelIcon} width="24" height="24" alt="Icon to cancel the edit process" />
                </button>
                <button className="w-6" onClick={submitEdit}>
                  <Image src={checkIcon} width="24" height="24" alt="Icon to save the edit process" />
                </button>
              </div>
            </>
            : checkIfAdmin() ?
              <>
                <h1 className={`${kurintoBook.className} text-3xl`}>{name}</h1>
                <div className="flex gap-3">
                  <button className="p-1" onClick={() => setIsEditing(true)}>
                    <Image src={editIcon} width="24" height="24" alt="Icon to edit the name" />
                  </button>
                  <button className="p-1 rounded" onClick={submitDelete}>
                    <Image src={deleteIcon} width="24" height="24" alt="Icon to edit the name" />
                  </button>
                </div>
              </>

              :
              <h1 className={`${kurintoBook.className} text-3xl`}>{name}</h1>

          }

        </div>
        <div className="gap-3 pb-5">{
          props.syllabi ?
            props.syllabi.map(s => {
              return <div key={s.uuid} className="flex gap-1">
                {getSyllabusCards([s], default_filters, undefined, props.user.name)?.elements}
                <div className="border-2 border-gray-900 p-2 rounded-md flex items-center">
                  <button data-syllabusid={s.uuid} onClick={handleRemove}>
                    <Image src={removeIcon} width="24" height="24" alt="Icon to remove an element from the list" />
                  </button>
                </div>
              </div>

            })
            :
            <>There are no syllabi in this collection. {checkIfAdmin() ? <><Link href="/" className="underline">Browse syllabi</Link> to add them to your collection.</> : <></>}</>
        }</div>
      </div>
    </>
  );
};

export default Collection;
