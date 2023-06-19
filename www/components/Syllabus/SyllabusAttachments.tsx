import React, { useContext, useState } from "react";

import { IAttachment } from "types";
import { kurintoSerif } from "app/layout";
import { signOut, useSession } from "next-auth/react";
import NewSyllbusAttachment from "components/NewSyllabus/NewSyllabusAttachment";
import Router from "next/router";
import SyllabusResource from "./SyllabusResource";
import { EditContext } from "context/EditContext";

interface ISyllabusAttachmentsProps {
  attachments?: IAttachment[];
}

const SyllabusAttachments: React.FunctionComponent<ISyllabusAttachmentsProps> = ({
  attachments
}) => {
  const ctx = useContext(EditContext)
  const [newAttachmentData, setNewAttachmentData] = useState<IAttachment[]>([])
  const [attachmentData, setAttachmentData] = useState(
    attachments ? attachments.map((att, i) => {
      att.id = i.toString()
      att.type = att.url ? att.url.startsWith("http") ? "url" : "file" : "file"
      return att
    }) : []
  );
  const [log, setLog] = useState('')
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
    if (ctx.syllabusUUID == "") {
      setLog("Something went wrong, please reload the page.")
      console.warn("missing syllabus ID", ctx.syllabusUUID)
    }
    _endpoint.searchParams.append("syllabus_id", ctx.syllabusUUID as string)

    const res = await fetch(_endpoint, {
      method: "POST",
      headers: h,
      body: b
    })

    if (res.ok) {
      const newData: IAttachment = await res.json()
      setAttachmentData([...attachmentData, newData])
      setNewAttachmentData([] as IAttachment[])
    } else if (res.status == 401) {
      signOut({ redirect: false }).then((result) => {
        Router.push("/auth/signin");
      })
    } else {
      const body = await res.text()
      setLog(`An error occured while saving: ${body}`)
    }
  }

  return <div className="syllabus-resources">
    <div className="flex gap-2 items-center mb-2">
      <h2 className={`${kurintoSerif.className} font-bold text-lg`}>Course Resources</h2>
    </div>

    <div className="lg:w-1/2 flex flex-col gap-8">
      <div>
        {attachmentData.length > 0 ? attachmentData.map((att) => (
          <SyllabusResource att={att} key={`att-${att.uuid}`}
            onDelete={(_uuid: string) => { setAttachmentData(attachmentData.filter(_a => _a.uuid !== _uuid)) }}
            onEdit={(_att: IAttachment) => { setAttachmentData(attachmentData.map(_a => { return _a.uuid == _att.uuid ? _att : _a })) }} />
        )) : <div className="text-sm text-gray-400">No resources to show.</div>}
      </div>
      {ctx.isOwner ?
        <NewSyllbusAttachment attachmentData={newAttachmentData} setAttachmentData={(_att: IAttachment[]) => createAttachment(_att)} />
        :
        <></>
      }
    </div>
  </div>;
};

export default SyllabusAttachments;
