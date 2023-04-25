import { signOut, useSession } from "next-auth/react";
import Router from "next/router";
import { useContext, useState } from "react";
import Image from "next/image";
import editIcon from '../../public/icons/edit-line.svg'
import cancelIcon from '../../public/icons/close-line.svg'
import checkIcon from '../../public/icons/check-line.svg'
import addIcon from '../../public/icons/add-line.svg'
import removeIcon from '../../public/icons/subtract-line.svg'
import { IInstitution } from "types";
import { EditContext } from "context/EditContext";

interface IUserInstitutionsProps {
  userInstitutions: IInstitution[] | undefined,
}

const UserInstitutions: React.FunctionComponent<IUserInstitutionsProps> = ({
  userInstitutions
}) => {
  const ctx = useContext(EditContext)
  const [log, setLog] = useState('')
  const [isEditing, setIsEditing] = useState(false);
  const [institutions, setInstitutions] = useState(userInstitutions ? userInstitutions : [])
  const [tmp, setTmp] = useState(userInstitutions ? userInstitutions : [])
  const [toDelete, setToDelete] = useState<string[]>([])
  const { data: session } = useSession();

  const submitEdit = async () => {
    setLog("saving...")
    const h = new Headers();
    h.append("Authorization", `Bearer ${session?.user.token}`);

    toDelete.forEach(async (uuid) => {
      const endpoint = new URL(`/users/${ctx.userUUID}/institutions/${uuid}`, process.env.NEXT_PUBLIC_API_URL)
      const res = await fetch(endpoint, {
        method: 'DELETE',
        headers: h
      })
      if (!res.ok) {
        setLog(`error deleting: ${uuid}`)
        return
      }
    })

    let results: IInstitution[] = [];
    for (const t of tmp) {
      const endpoint = new URL(`/users/${ctx.userUUID}/institutions/${t.uuid}`, process.env.NEXT_PUBLIC_API_URL)
      let b = new FormData()
      b.append("name", t.name)

      let m
      if (t.uuid == undefined)
        m = "POST"
      else if (t.uuid.length > 0)
        m = "PATCH"
      else {
        console.warn("Uncaught type of operation:", t)
      }

      const res = await fetch(endpoint, {
        method: m,
        headers: h,
        body: b
      })

      if (res.status == 401) {
        signOut({ redirect: false }).then((result) => {
          Router.push("/auth/signin");
        })
        return;
      } if (!res.ok) {
        const body = await res.text()
        setLog(`An error occured while saving: ${body}`)
        return;
      }

      const data = await res.json()
      results = data.institutions;
    }

    setIsEditing(false)
    if (results)
      setInstitutions([...results])
    setLog('')
  }

  const handleChange = (e: React.BaseSyntheticEvent) => {
    e.preventDefault()
    const t = e.target;
    tmp[t.dataset.index].name = t.value;
    setTmp(tmp)
  }

  const add = () => {
    setTmp([...tmp, {} as IInstitution])
  }

  const remove = (e: React.BaseSyntheticEvent) => {
    const i = e.target.dataset.index
    if (tmp[i].uuid)
      setToDelete([...toDelete, tmp[i].uuid])
    tmp.splice(i, 1)
    setTmp([...tmp])
  }

  return (
    <div id="user-education" className="py-4">
      
      <div className="flex justify-between">
        <h3 className="text-lg">Institutions</h3>
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
              <li key={`${item.name}-${_index}`}>
                <input type="text" defaultValue={item.name} data-index={_index} onChange={handleChange} className="w-11/12 bg-transparent mt-2 py-1 border-b-2 border-b-gray-900"></input>
                <button data-index={_index} onClick={remove}>
                  <Image data-index={_index} src={removeIcon} width="24" height="24" alt="Icon to remove an element from the list" />
                </button>
              </li>
            ))}
          </ul>
          <button onClick={add} className="flex gap-2">
            <Image src={addIcon} width="24" height="24" alt="Icon to add an element to the list" /><div>Add an institution</div>
          </button>

          <div className="py-1 mt-4 flex flex-col lg:flex-row gap-2 justify-between">
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
        <div className="flex justify-between mb-3">
          <ul className="list-unstyled">
            {institutions.length === 0 ?
              <div className="text-sm text-gray-400">No affiliations yet.</div>
              :
              <></>
            }
            {institutions.map((item) => (
              <li key={item.name}>{item.name !== '' ? item.name : 'No education yet.'}</li>
            ))}</ul>
        </div>
      }

    </div>
  )
};

export default UserInstitutions;
