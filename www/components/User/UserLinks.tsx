import * as React from "react";
import Link from "next/link";
import { useState } from "react";
import { signOut, useSession } from "next-auth/react";
import Router from "next/router";

interface IUserLinksProps {
  userLinks: string[],
  isAdmin: boolean,
  apiUrl: string,
}

const UserLinks: React.FunctionComponent<IUserLinksProps> = ({ userLinks, isAdmin, apiUrl }) => {

  const [log, setLog] = useState('')
  const [isEditing, setIsEditing] = useState(false);
  const [links, setLinks] = useState(userLinks)
  const [tmp, setTmp] = useState(userLinks)
  const { data: session } = useSession();

  const submitEdit = () => {
    const h = new Headers();
    h.append("Authorization", `Bearer ${session?.user.token}`);

    let malformedURL = '';
    tmp.forEach(t => {
      try {
        new URL(t)
      } catch (error) {
        console.log(error);
        malformedURL = t
      }
    })

    if (malformedURL !== '') {
      setLog(`${malformedURL} does not seem to be a URL!`)
      return
    }


    let b = new FormData()
    tmp.forEach(e => {
      b.append("urls[]", e)
    })

    fetch(apiUrl, {
      method: 'PATCH',
      headers: h,
      body: b
    })
      .then((res) => {
        if (res.ok) {
          setIsEditing(false)
          setLinks(tmp)
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

  const handleChange = (e: React.BaseSyntheticEvent) => {
    e.preventDefault()
    const t = e.target;
    tmp[t.dataset.index] = t.value;
    setTmp(tmp)
  }

  const add = () => {
    setTmp([...tmp, ""])
  }

  const remove = (e: React.BaseSyntheticEvent) => {
    const i = e.target.dataset.index
    tmp.splice(i, 1)

    setTmp([...tmp])
  }

  if (!links || links.length === 0) {
    return null;
  }

  return (
    <div id="user-links">
      {isEditing ?
        <div>
          <ul>
            {tmp.map((item, _index) => (
              <li key={`${item}-${_index}`}>
                <input type="text" defaultValue={item} data-index={_index} onChange={handleChange}></input>
                <button data-index={_index} onClick={remove}>-</button>
              </li>
            ))}
            <li>
              <button onClick={add}>+</button>
            </li>
          </ul>

          <button onClick={() => { setIsEditing(false); }}>cancel</button>
          <button onClick={submitEdit}>save</button>
          <div>{log}</div>
        </div>
        :
        <div className="user-links-item mb-3">
          <ul className="list-unstyled">{links.map((link) => (
            <li key={link}>
              <Link href={link} target="_blank" rel="noreferrer">
                {link}
              </Link>
            </li>
          ))}</ul>
          {isAdmin ?

            <button onClick={() => setIsEditing(true)}>edit</button>
            : <></>}
        </div>
      }
    </div>
  );
};

export default UserLinks;
