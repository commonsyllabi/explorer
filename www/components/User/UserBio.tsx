import { signOut, useSession } from "next-auth/react";
import Router from "next/router";
import * as React from "react";
import { useState } from "react";
import Image from "next/image";
import editIcon from '../../public/icons/edit-line.svg'
import cancelIcon from '../../public/icons/close-line.svg'
import checkIcon from '../../public/icons/check-line.svg'

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
    b.append("bio", tmp)

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
    <div className="mt-5 flex flex-col">
      <div className="flex justify-between">
        <h3 className="text-lg">Bio</h3>
        {isAdmin && !isEditing ?
          <button onClick={() => setIsEditing(true)}>
            <Image src={editIcon} width="18" height="18" alt="Icon to edit the name" />
          </button>
          : <></>}
      </div>
      {isEditing ?
        <div>
          <textarea value={tmp} placeholder="A few lines about you." onChange={handleChange} className="w-full bg-transparent border border-gray-900 p-1 rounded-lg" />
          <div className="py-1 mt-2 flex flex-col lg:flex-row gap-2 justify-between">
            <button className="flex items-center gap-2 rounded-lg border border-1 border-gray-900 py-1 px-2 bg-red-100 hover:bg-red-300" onClick={() => { setIsEditing(false); }}>
              <Image src={cancelIcon} width="24" height="24" alt="Icon to cancel the edit process" />
              <div>Cancel</div>
            </button>
            <button className="flex items-center gap-2 rounded-lg border border-1 border-gray-900 py-1 px-2" onClick={submitEdit}>
              <Image src={checkIcon} width="24" height="24" alt="Icon to save the edit process" />
              <div>Save</div>
            </button>
          </div>
          <div>{log}</div>
        </div>
        :
        <div className={`text-sm whitespace-pre-wrap ${bio.length == 0 ? `text-gray-400` : ''}`}>
          {bio.length > 0 ? bio : 'User has not written a bio.'}
        </div>
      }
    </div>
  );
};

export default UserBio;
