import React, { useState } from "react";

import { IAttachment, ISyllabus } from "types";

import SyllabusAttachment from "components/Syllabus/SyllabusAttachment";
import Image from "next/image";
import editIcon from '../../public/icons/edit-box-line.svg'
import cancelIcon from '../../public/icons/close-line.svg'
import checkIcon from '../../public/icons/check-line.svg'
import { kurintoSerif } from "app/layout";
import { signOut, useSession } from "next-auth/react";
import NewSyllbusAttachment from "components/NewSyllabus/NewSyllabusAttachment";
import Router from "next/router";
import AttachmentItemEditable from "components/NewSyllabus/AttachmentItemEditable";

interface ISyllabusAttachmentsProps {
  attachments?: IAttachment[];
  apiUrl: URL,
  syllabusID: string,
  isAdmin: boolean
}

const SyllabusAttachments: React.FunctionComponent<ISyllabusAttachmentsProps> = ({
  attachments, apiUrl, syllabusID, isAdmin
}) => {
  const [newAttachmentData, setNewAttachmentData] = useState<IAttachment[]>([])
  const [attachmentData, setAttachmentData] = useState(
    attachments ? attachments.map((att, i) => {
      att.id = i.toString()
      att.type = att.url ? att.url.startsWith("http") ? "url" : "file" : "file"
      return att
    }) : []
  );
  const [log, setLog] = useState('')
  const [isEditing, setIsEditing] = useState(false);
  const { data: session } = useSession();


  const createAttachment = async (_data: IAttachment[]) => {
    const att = _data[0]
    if (att.name.length < 3) {
      setLog("The name should be at least 3 characters long.")
      return;
    }

    if (att.url === "" && att.size === "") {
      setLog("The resource should include at least a URL or a file.")
      return;
    }

    const h = new Headers();
    h.append("Authorization", `Bearer ${session?.user.token}`);

    let b = new FormData()
    b.append("name", att.name);
    b.append("description", att.description ? att.description : "");
    b.append("file", att.file ? att.file : "");
    b.append("url", att.url ? att.url : "")

    const _endpoint = new URL(`/attachments/`, process.env.NEXT_PUBLIC_API_URL)
    if (syllabusID == "") {
      setLog("Something went wrong, please reload the page.")
      console.warn("missing syllabus ID", syllabusID)
    }
    _endpoint.searchParams.append("syllabus_id", syllabusID)

    const res = await fetch(_endpoint, {
      method: "POST",
      headers: h,
      body: b
    })

    if (res.ok) {
      const newData: IAttachment = await res.json()
      setAttachmentData([...attachmentData, newData])
      setIsEditing(false)
    } else if (res.status == 401) {
      signOut({ redirect: false }).then((result) => {
        Router.push("/auth/signin");
      })
    } else {
      const body = await res.text()
      setLog(`An error occured while saving: ${body}`)
    }
  }

  if (attachments === undefined || attachments.length < 1) {
    return <p className="text-gray-600">No attachments to show.</p>;
  }

  return <div className="syllabus-resources">
    <div className="flex gap-2 items-center mb-2">
      <h2 className={`${kurintoSerif.className} font-bold text-lg`}>Course Resources</h2>
      {isAdmin && !isEditing ?
        <button className="ml-8" onClick={() => setIsEditing(true)}>
          <Image src={editIcon} width="24" height="24" alt="Icon to edit the title" />
        </button>
        : <></>}
    </div>
    {!isEditing ?
      <div>
        {attachmentData.map((att) => (
          <SyllabusAttachment
            resourceTitle={att.name}
            resourceUrl={att.url ? att.url : ""}
            resourceDescription={att.description ? att.description : ""}
            resourceType={att.type}
            key={att.uuid}
          />
        ))}

      </div>
      :
      <div className="full flex flex-col justify-between">

        {/* either edit/delete */}
        {attachmentData.map((att) => (
          <AttachmentItemEditable
            key={`attachment-editable-${att.uuid}`}
            attachment={att}
            onDelete={(_uuid: string) => { setAttachmentData(attachmentData.filter(_a => _a.uuid !== _uuid)) }}
            onEdit={(_att: IAttachment) => { setAttachmentData([...attachmentData, att]) }}
          />
        ))}

        <NewSyllbusAttachment
          attachmentData={newAttachmentData}
          setAttachmentData={(_att: IAttachment[]) => createAttachment(_att)}
        />

        <div className="py-1 mt-2 flex flex-col lg:flex-row gap-2 justify-between">
          <button className="flex items-center gap-2 rounded-lg border border-1 border-gray-900 py-1 px-2 bg-red-100 hover:bg-red-300" onClick={() => { setIsEditing(false); }}>
            <Image src={cancelIcon} width="24" height="24" alt="Icon to cancel the edit process" />
            <div>Cancel</div>
          </button>
          <button className="flex items-center gap-2 rounded-lg border border-1 border-gray-900 py-1 px-2">
            <Image src={checkIcon} width="24" height="24" alt="Icon to save the edit process" />
            <div>Save</div>
          </button>
        </div>

        <div>{log}</div>
      </div>}

  </div>;
};

export default SyllabusAttachments;
