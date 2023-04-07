import { useSession } from "next-auth/react";
import * as React from "react";
import { useState } from "react";

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
  const [education, setEducation] = useState(userEducation)
  const [tmp, setTmp] = useState(userEducation)
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
      if(res.ok){
        setIsEditing(false)
        setEducation(tmp)
        setLog('')
      }else{
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

  // if no data
  if (education === undefined || education.length === 0) {
    return (
      <div id="user-education" className="py-4">
        <h3 className="h6">Education</h3>
        <div className="text-muted">No education specified</div>
      </div>
    )
  }

  return (
    <div id="user-education" className="py-4">
      <h3 className="h6">Education</h3>
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

          <button onClick={() => { setIsEditing(false);}}>cancel</button>
          <button onClick={submitEdit}>save</button>
          <div>{log}</div>
        </div>
        :
        <div className="user-institutions-item mb-3">
          <ul className="list-unstyled">{education.map((item) => (
            <li key={item}>{item}</li>
          ))}</ul>
          <button onClick={() => setIsEditing(true)}>edit</button>
        </div>
      }

    </div>
  );
};

export default UserEducation;
