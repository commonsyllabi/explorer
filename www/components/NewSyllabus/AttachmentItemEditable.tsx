import * as React from "react";
import Image from "next/image";
import deleteIcon from '../../public/icons/delete-bin-line.svg'
import editIcon from '../../public/icons/edit-box-line.svg'


import { IAttachment } from "types";
import { signOut, useSession } from "next-auth/react";
import Router from "next/router";
import { useState } from "react";
import Link from "next/link";

interface IAttachmentItemEditableProps {
  attachment: IAttachment;
  onDelete: Function,
  onEdit: Function,
}

const AttachmentItemFile: React.FunctionComponent<IAttachmentItemEditableProps> = ({
  attachment, onDelete, onEdit
}) => {
  const { data: session } = useSession()
  const [log, setLog] = useState("")
  const [name, setName] = useState(attachment.name)
  const [description, setDescription] = useState(attachment.description as string)
  const [url, setUrl] = useState(attachment.url as string)
  const [type, setType] = useState(attachment.type as string)

  const [file, setFile] = useState({
    name: attachment.url as string,
    size: "",
    type: "",
  });
  const [rawFile, setRawFile] = useState<File>()

  const fileUrl = process.env.NODE_ENV === "production" ?
    new URL(`uploads/${attachment.url}`, process.env.NEXT_PUBLIC_STORAGE_URL) : new URL(`static/${attachment.url}`, process.env.NEXT_PUBLIC_API_URL)

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

  const handleFileChange = (e: React.BaseSyntheticEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const f = e.target.files[0]
    setFile({
      name: f.name,
      size: (f.size * 0.000001).toFixed(2), //-- from byte to megabyte
      type: f.type
    })
    setRawFile(f)

  }

  const submitChanges = async (e: React.BaseSyntheticEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const h = new Headers();
    h.append("Authorization", `Bearer ${session?.user.token}`);

    const b = new FormData()
    b.append("name", name)
    b.append("description", description)
    if (type === "weblink")
      b.append("url", url)
    else if (type === "file")
      b.append("file", rawFile as Blob)
    else {
      console.warn("Existing attachment type unknown:", type)
      if (url.startsWith("http"))
        b.append("url", url)
      else if (rawFile)
        b.append("file", rawFile)
    }

    const edit_url = new URL(`attachments/${attachment.uuid}`, process.env.NEXT_PUBLIC_API_URL)
    const res = await fetch(edit_url, {
      method: 'PATCH',
      headers: h,
      body: b,
    })

    if (res.ok) {
      setLog("Success!")
      setUrl(file.name)
      setTimeout(() => {
        setLog("")
      }, 2000)
      const att: IAttachment = await res.json()
      onEdit(att)
    } else if (res.status == 401) {
      signOut({ redirect: false }).then((result) => {
        Router.push("/auth/signin");
      })
      return;
    }
    const body = await res.text()
    setLog(`An error occured while saving edits: ${body}`)

  }

  const deleteAttachment = async (e: React.SyntheticEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!window.confirm(confirmMsg))
      return

    const h = new Headers();
    h.append("Authorization", `Bearer ${session?.user.token}`);

    const url = new URL(`attachments/${attachment.uuid}`, process.env.NEXT_PUBLIC_API_URL)
    const res = await fetch(url, {
      method: 'DELETE',
      headers: h,
    })

    if (res.ok) {
      setLog("Successfully deleted attachment!")

      onDelete(attachment.uuid)
    } else if (res.status == 401) {
      signOut({ redirect: false }).then((result) => {
        Router.push("/auth/signin");
      })
      return res.text()
    } else {
      return res.text()
    }

    const body = res.text()
    setLog(`An error occured while deleting: ${body}`)

  };

  return (
    <div className="my-3 p-3 rounded-md bg-gray-100 border-gray-400 border-2">
      <div className="font-bold w-full">
        <input type="text" value={name} onChange={handleNameChange} className="bg-transparent mt-2 py-1 border-b-2 border-b-gray-900" />
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
          <div className="flex flex-col gap-2 items-start">
            <div className="small">
              <span className="font-bold">Filename:</span> <Link href={fileUrl} target="_blank" rel="noreferrer" className="underline">{attachment.url}</Link>
            </div>
            <div className="flex flex-col my-6">

              <label>Replace the existing file:</label>
              <input
                onChange={handleFileChange}
                type="file"
                className="mt-2 py-1"
                id="file"
                data-cy={"new-attachment-file"}
              />

              <div>
                <div>{file.type ? `Type: ${file.type}` : ''}</div>
                <div>{file.size ? `Size: ${file.size} Mb` : ''}</div>
              </div>

            </div>
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
        <button id={attachment.uuid}
          onClick={deleteAttachment} className="flex p-2 bg-red-100 hover:bg-red-400 border-2 border-red-500 rounded-md gap-3" >
          <Image src={deleteIcon} width="24" height="24" alt="Icon to edit the name" />
          <div>Delete attachment</div>
        </button>
      </div>
    </div>
  );

};

export default AttachmentItemFile;
