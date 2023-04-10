import { signOut, useSession } from "next-auth/react";
import Router from "next/router";
import * as React from "react";
import { useState } from "react";

interface IUserBioProps {
  userBio: string | undefined,
  isAdmin: boolean,
  apiUrl: string,
}

const UserBio: React.FunctionComponent<IUserBioProps> = ({ userBio, isAdmin, apiUrl }) => {

  const [log, setLog] = useState('')
  const [isEditing, setIsEditing] = useState(false);
  const [bio, setBio] = useState(userBio ? userBio as string : '')
  const [tmp, setTmp] = useState(bio)
  const { data: session } = useSession();

  const handleChange = (e: React.BaseSyntheticEvent) => {
    e.preventDefault()
    setTmp(e.target.value)
  }

  const submitEdit = () => {
    const h = new Headers();
    h.append("Authorization", `Bearer ${session?.user.token}`);

    let b = new FormData()
    b.append("bio", bio)

    fetch(apiUrl, {
      method: 'PATCH',
      headers: h,
      body: b
    })
      .then((res) => {
        if (res.ok) {
          setIsEditing(false)
          setBio(tmp)
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

  return (
    <div className="mt-5 d-flex flex-column">
      {isEditing ?
        <div>
          <input type="text" value={tmp} onChange={handleChange}></input>
          <button onClick={() => { setIsEditing(false); }}>cancel</button>
          <button onClick={submitEdit}>save</button>
          <div>{log}</div>
        </div>
        :
        <div>
          <p className="text-muted">{bio.length > 0 ? bio : 'User has not written a bio.'}</p>
          {isAdmin ?

            <button onClick={() => setIsEditing(true)}>edit</button>
            : <></>}
        </div>
      }
    </div>
  );
};

export default UserBio;
