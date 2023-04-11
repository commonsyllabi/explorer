import type { GetServerSideProps, GetServerSidePropsContext, NextPage } from "next";
import Head from "next/head";
import Image from "next/image";

import { IUser, ISyllabus } from "types";

import Favicons from "components/head/favicons";
import GlobalNav from "components/GlobalNav";
import BreadcrumbsBar from "components/BreadcrumbsBar";

import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

import { getSyllabusCards } from "components/utils/getSyllabusCards";
import NotFound from "components/NotFound";
import { signOut, useSession } from "next-auth/react";
import React, { useState } from "react";
import Router from "next/router";
import { getToken } from "next-auth/jwt";

export const getServerSideProps: GetServerSideProps = async (context: GetServerSidePropsContext) => {
  const collectionId = context.params!.cid;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const t = await getToken({req: context.req, secret: process.env.NEXTAUTH_SECRET})
  const token = t ? (t.user as { _id: string, token: string }).token : '';
  const url = new URL(`collections/${collectionId}`, apiUrl);

  const h = new Headers();
  if(t)
    h.append("Authorization", `Bearer ${token}`);

  const res = await fetch(url, {headers: h});
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
  const [name, setName] = useState(props.name)
  const [tmp, setTmp] = useState(props.name)
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

  const checkIfAdmin = () => {
    if (session != null && session.user != null) {
      return session.user._id === props.user_uuid;
    }
    return false
  };

  const submit = () => {
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

  if (Object.keys(props).length === 0) {
    return (
      <NotFound />
    )
  }

  return (
    <>
      <Head>
        <title>{`Cosyll | ${props.name}`}</title>
        <meta name="description" content="Generated by create next app" />
        <Favicons />
      </Head>

      <Container fluid id="header-section" className="sticky-top">
        <GlobalNav />
        <BreadcrumbsBar
          user={props.user.name}
          userId={props.user_uuid}
          category="collections"
          pageTitle={props.name}
        />
      </Container>

      <Container>
        <Row className="pt-3 pb-3">
          {isEditing ?
            <>
              <input value={tmp} defaultValue={name} onChange={handleChange}></input>
              <button onClick={submit}>save</button>
              <button onClick={() => setIsEditing(false)}>cancel</button>
            </>
            : checkIfAdmin() ?
              <>
                <h1>{name}</h1>
                <button onClick={() => setIsEditing(true)}>edit</button>
                <button onClick={submitDelete}>delete</button>
              </>
              :
              <h1>{name}</h1>
          }

        </Row>
        <Row className="gap-3 pb-5">{
          props.syllabi ?
          props.syllabi.map(s => {
            return <div key={s.uuid}>
              {getSyllabusCards([s], default_filters, undefined, props.user.name)?.elements}
              <button onClick={handleRemove} data-syllabusid={s.uuid}>remove</button>
            </div>

          })
          : 
          <>No syllabi yet.</>
        }</Row>
      </Container>
    </>
  );
};

export default Collection;
