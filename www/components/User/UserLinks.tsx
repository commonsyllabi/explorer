import Link from "next/link";
import { useContext, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import Router from "next/router";
import Image from "next/image";
import editIcon from '../../public/icons/edit-line.svg'
import cancelIcon from '../../public/icons/close-line.svg'
import checkIcon from '../../public/icons/check-line.svg'
import addIcon from '../../public/icons/add-line.svg'
import removeIcon from '../../public/icons/subtract-line.svg'
import { EditContext } from "context/EditContext";

interface IUserLinksProps {
  userLinks: string[],
}

const UserLinks: React.FunctionComponent<IUserLinksProps> = ({ userLinks }) => {
  const ctx = useContext(EditContext)
  const [log, setLog] = useState('')
  const [isEditing, setIsEditing] = useState(false);
  const [links, setLinks] = useState(userLinks)
  const [tmp, setTmp] = useState(userLinks)
  const { data: session } = useSession();

  const submitEdit = () => {
    const h = new Headers();
    h.append("Authorization", `Bearer ${session?.user.token}`);

    let malformedURL: string[] = [];
    tmp.forEach(t => {
      try {
        new URL(t)
      } catch (error) {
        console.log(error);
        malformedURL.push(t)
      }
    })

    if (malformedURL.length > 0) {
      setLog(`${malformedURL.join(", ")} do not seem to be a URL!`)
      return
    }


    let b = new FormData()
    tmp.forEach(e => {
      b.append("urls[]", e)
    })

    const endpoint = new URL(`/users/${ctx.userUUID}`, process.env.NEXT_PUBLIC_API_URL)
    fetch(endpoint, {
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
    <div id="user-links" className="mt-5" data-cy="user-links">
      <div className="flex justify-between">
        <h3 className="text-lg">Links</h3>
        {ctx.isOwner && !isEditing ?
          <button className="ml-8" onClick={() => setIsEditing(true)}>
            <Image src={editIcon} width="18" height="18" alt="Icon to edit the name" />
          </button>
          : <></>}
      </div>
      {isEditing ?
        <div>
          <ul className="mb-2">
            {tmp.map((item, _index) => (
              <li key={`${item}-${_index}`} className="flex justify-between">
                <input type="text" defaultValue={item} data-index={_index} onChange={handleChange} className="w-11/12 bg-transparent mt-2 py-1 border-b-2 border-b-gray-900"></input>
                <button data-index={_index} onClick={remove}>
                  <Image src={removeIcon} width="24" height="24" alt="Icon to remove an element from the list" />
                </button>
              </li>
            ))}
          </ul>
          <button data-cy="add-item-button" onClick={add} className="flex">
            <Image src={addIcon} width="24" height="24" alt="Icon to add an element to the list" />
            <div>Add URL</div>
          </button>

          <div className="py-1 mt-4 flex flex-col lg:flex-row gap-2 justify-between">
            <button className="flex items-center gap-2 rounded-lg border border-1 border-gray-900 py-1 px-2 bg-red-100 hover:bg-red-300" onClick={() => { setIsEditing(false); }}>
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
        :
        <div className="flex justify-between mb-3">
          <ul className="list-unstyled">
            {links.length === 0 ?
              <div className="text-sm text-gray-400">No links yet.</div>
              :
              <></>
            }
            {links.map((link) => (
              <li data-cy="user-link" key={link}>
                <Link href={link} target="_blank" rel="noreferrer" className="underline">
                  {link}
                </Link>
              </li>
            ))}</ul>
        </div>
      }
    </div>
  );
};

export default UserLinks;
