import * as React from "react";
import Image from "next/image";
import deleteIcon from '../../public/icons/delete-bin-line.svg'
import editIcon from '../../public/icons/edit-box-line.svg'


import { IAttachment } from "types";
import { signOut, useSession } from "next-auth/react";
import Router from "next/router";
import { useState } from "react";

interface IAttachmentItemEditableProps {
  attachment: IAttachment;
}

const AttachmentItemFile: React.FunctionComponent<IAttachmentItemEditableProps> = ({
  attachment
}) => {
  const { data: session } = useSession()
  const [log, setLog] = useState("")
  const [name, setName] = useState(attachment.name)
  const [description, setDescription] = useState(attachment.description as string)
  const [url, setUrl] = useState(attachment.url as string)
  const confirmMsg = `Do you really want to delete the attachment ${attachment.name}? This action cannot be undone.`;

  const handleNameChange = (e: React.BaseSyntheticEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const value = e.target.value
    setName(value)
  }

  const handleDescriptionChange = (e: React.BaseSyntheticEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const value = e.target.value
    setDescription(value)
  }

  const handleUrlChange = (e: React.BaseSyntheticEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const value = e.target.value
    setUrl(value)
  }


  const submitChanges = (e: React.BaseSyntheticEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const h = new Headers();
    h.append("Authorization", `Bearer ${session?.user.token}`);

    const b = new FormData()
    b.append("name", name)
    b.append("description", description)
    b.append("url", url)

    const edit_url = new URL(`attachments/${attachment.uuid}`, process.env.NEXT_PUBLIC_API_URL)
    fetch(edit_url, {
      method: 'PATCH',
      headers: h,
      body: b,
    })
      .then((res) => {
        if (res.ok) {
          setLog("Success!")
          setTimeout(() => {
            setLog("")
          }, 2000)
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
        setLog(`An error occured while saving edits: ${body}`)
      })
  }

  const deleteAttachment = (e: React.SyntheticEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!window.confirm(confirmMsg))
      return

    const h = new Headers();
    h.append("Authorization", `Bearer ${session?.user.token}`);

    const url = new URL(`attachments/${attachment.uuid}`, process.env.NEXT_PUBLIC_API_URL)
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
  };

  return (
    <div className="my-3 p-3 rounded-md bg-gray-100 border-gray-400 border-2">
      <div className="font-bold w-full">
        #{parseInt(attachment.id) + 1} - <input type="text" value={name} onChange={handleNameChange} className="bg-transparent mt-2 py-1 border-b-2 border-b-gray-900" />
      </div>

      {attachment.type === "url" ?
        <div className="my-2">
          <textarea className="w-full bg-transparent mt-2 p-1 border border-gray-900" rows={4} value={description} placeholder="No description" onChange={handleDescriptionChange} />
          <div>
            <input type="url" value={url} onChange={handleUrlChange} className="w-full bg-transparent mt-2 py-1 border-b-2 border-b-gray-900" />
          </div>
        </div>
        : <>
          <textarea className="bg-transparent mt-2 p-1 border border-gray-900 w-1/2" rows={4} value={attachment.description} placeholder="No description" onChange={handleDescriptionChange} />
          <div className="flex flex-col md:flex-row gap-2">
            <p className="small">
              <span className="font-bold">Size:</span> {attachment.size} Mb
            </p>
            <p className="small">
              <span className="font-bold">Type:</span>{" "}
              <div>{attachment.type}</div>
            </p>
          </div>
        </>}


      <div className="flex items-center justify-between gap-3 mt-8">
        <button onClick={submitChanges} className="flex p-2 rounded-md gap-3 border border-gray-900" >
          <Image src={editIcon} width="24" height="24" alt="Icon to edit the name" />
          <div>Save changes</div>
        </button>
        <div>
          {log}
        </div>
        <button id={attachment.id.toString()}
          data-cy={`attachment-remove-${attachment.id.toString()}`}
          onClick={deleteAttachment} className="flex p-2 bg-red-100 hover:bg-red-400 border-2 border-red-500 rounded-md gap-3" >
          <Image src={deleteIcon} width="24" height="24" alt="Icon to edit the name" />
          <div>Delete attachment</div>
        </button>
      </div>
    </div>
  );

};

export default AttachmentItemFile;
