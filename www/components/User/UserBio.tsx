import { useSession } from "next-auth/react";
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
  const [originalBio, setOriginalBio] = useState(bio)
  const { data: session } = useSession();

  const handleChange = (e: React.BaseSyntheticEvent) => {
    e.preventDefault()
    setBio(e.target.value)
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
      console.log(res);
      if(res.ok){
        setIsEditing(false)
        setOriginalBio(bio)
        setLog('')
      }else{
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
          <input type="text" value={bio} onChange={handleChange}></input>
          <button onClick={() => { setIsEditing(false); setBio(originalBio) }}>cancel</button>
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
