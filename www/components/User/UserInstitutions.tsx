import { signOut, useSession } from "next-auth/react";
import Router from "next/router";
import { useState } from "react";
import Image from "next/image";
import editIcon from '../../public/icons/edit-box-line.svg'
import cancelIcon from '../../public/icons/close-line.svg'
import checkIcon from '../../public/icons/check-line.svg'
import addIcon from '../../public/icons/add-line.svg'
import removeIcon from '../../public/icons/subtract-line.svg'
import { IInstitution } from "types";

interface IUserInstitutionsProps {
  userInstitutions: IInstitution[] | undefined,
  isAdmin: boolean,
  apiUrl: string,
}

const UserInstitutions: React.FunctionComponent<IUserInstitutionsProps> = ({
  userInstitutions,
  isAdmin, apiUrl
}) => {
  const [log, setLog] = useState('')
  const [isEditing, setIsEditing] = useState(false);
  const [institutions, setEducation] = useState(userInstitutions ? userInstitutions : [])
  const [tmp, setTmp] = useState(userInstitutions ? userInstitutions : [])
  const { data: session } = useSession();

  const submitEdit = () => {
    const h = new Headers();
    h.append("Authorization", `Bearer ${session?.user.token}`);

    console.warn("change the endpoint to reach user institutions",institutions)
    return

    let b = new FormData()

    fetch(apiUrl, {
      method: 'PATCH',
      headers: h,
      body: b
    })
      .then((res) => {
        if (res.ok) {
          setIsEditing(false)
          setEducation(tmp)
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
    setTmp([...tmp, {} as IInstitution])
  }

  const remove = (e: React.BaseSyntheticEvent) => {
    const i = e.target.dataset.index
    tmp.splice(i, 1)

    setTmp([...tmp])
  }
  
  return(
    <div id="user-education" className="py-4">
      <h3 className="text-lg">Institutions</h3>

      {isEditing ?
        <div>
          <ul className="mb-2">
            {tmp.map((item, _index) => (
              <li key={`${item.name}-${_index}`}>
                <input type="text" defaultValue={item.name} data-index={_index} onChange={handleChange} className="w-11/12 bg-transparent mt-2 py-1 border-b-2 border-b-gray-900"></input>
                <button data-index={_index} onClick={remove}>
                  <Image src={removeIcon} width="24" height="24" alt="Icon to remove an element from the list" />
                </button>
              </li>
            ))}
          </ul>
          <button onClick={add} className="flex gap-2">
            <Image src={addIcon} width="24" height="24" alt="Icon to add an element to the list" /><div>Add an institution</div>
          </button>

          <div className="py-1 mt-4 flex flex-col lg:flex-row gap-2 justify-between">
            <button className="flex gap-2 rounded-lg border border-1 border-gray-900 py-1 px-2 bg-red-100 hover:bg-red-300" onClick={() => { setIsEditing(false); }}>
              <Image src={cancelIcon} width="24" height="24" alt="Icon to cancel the edit process" />
              <div>Cancel</div>
            </button>
            <button className="flex gap-2 rounded-lg border border-1 border-gray-900 py-1 px-2" onClick={submitEdit}>
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
          {isAdmin ?
            <button className="ml-8" onClick={() => setIsEditing(true)}>
              <Image src={editIcon} width="18" height="18" alt="Icon to edit the name" />
            </button>
            : <></>}
        </div>
      }

    </div>
  )
};

export default UserInstitutions;
