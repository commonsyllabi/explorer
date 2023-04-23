import { signOut, useSession } from "next-auth/react";
import Router from "next/router";
import { useState } from "react";
import Image from "next/image";
import editIcon from '../../public/icons/edit-box-line.svg'
import cancelIcon from '../../public/icons/close-line.svg'
import checkIcon from '../../public/icons/check-line.svg'
import addIcon from '../../public/icons/add-line.svg'
import removeIcon from '../../public/icons/subtract-line.svg'

interface IUserEducationProps {
  userEducation: string[],
  isAdmin: boolean,
  apiUrl: string,
}

const UserEducation: React.FunctionComponent<IUserEducationProps> = ({
  userEducation,
  isAdmin, apiUrl
}) => {

  const [log, setLog] = useState('')
  const [isEditing, setIsEditing] = useState(false);
  const [education, setEducation] = useState(userEducation ? userEducation : [''])
  const [tmp, setTmp] = useState(userEducation ? userEducation : [''])
  const { data: session } = useSession();

  const submitEdit = () => {
    const h = new Headers();
    h.append("Authorization", `Bearer ${session?.user.token}`);

    let b = new FormData()
    tmp.forEach(e => {
      b.append("education[]", e)
    })

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
    setTmp([...tmp, ""])
  }

  const remove = (e: React.BaseSyntheticEvent) => {
    const i = e.target.dataset.index
    tmp.splice(i, 1)

    setTmp([...tmp])
  }

  return (
    <div id="user-education" className="py-4">
      <div className="flex justify-between">
        <h3 className="text-lg">Education</h3>
        {isAdmin && !isEditing ?
          <button className="ml-8" onClick={() => setIsEditing(true)}>
            <Image src={editIcon} width="18" height="18" alt="Icon to edit the name" />
          </button>
          : <></>}
      </div>

      {isEditing ?
        <div>
          <ul className="mb-2">
            {tmp.map((item, _index) => (
              <li key={`${item}-${_index}`}>
                <input type="text" defaultValue={item} data-index={_index} onChange={handleChange} className="w-11/12 bg-transparent mt-2 py-1 border-b-2 border-b-gray-900"></input>
                <button data-index={_index} onClick={remove}>
                  <Image src={removeIcon} width="24" height="24" alt="Icon to remove an element from the list" />
                </button>
              </li>
            ))}
          </ul>
          <button onClick={add} className="flex">
            <Image src={addIcon} width="24" height="24" alt="Icon to add an element to the list" />
            <div>Add a field of study</div>
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
            {education.length === 0 ?
              <div className="text-sm text-gray-400">No education yet.</div>
              :
              <></>
            }
            {education.map((item) => (
              <li key={item}>{item !== '' ? item : 'No education yet.'}</li>
            ))}</ul>
        </div>
      }

    </div>
  );
};

export default UserEducation;
