import * as React from "react";
import Image from "next/image";
import deleteIcon from '../../public/icons/delete-bin-line.svg'

import { IUploadAttachment } from "types";

interface IAttachmentItemFileProps {
  attachment: IUploadAttachment;
  attachmentData: IUploadAttachment[];
  setAttachmentData: Function;
}

const AttachmentItem: React.FunctionComponent<IAttachmentItemFileProps> = ({
  attachment,
  attachmentData,
  setAttachmentData,
}) => {
  const removeAttachment = () => {    
    let keepTheseAttachments = attachmentData.filter((att) => {
      return att.id != attachment.id;
    });
    setAttachmentData(keepTheseAttachments);
  };

  return (
    <div className="my-3 p-3 rounded-md bg-gray-100 border-gray-400 border-2">
      <div className="font-bold">
        #{parseInt(attachment.id) + 1} - {attachment.name}
      </div>

      {attachment.type === "url" ?
        <div className="my-2">
          <div className="my-3">
            {attachment.description ? attachment.description : 'No description.'}
          </div>
          <div>
            <a href={attachment.url} target="_blank" rel="noreferrer" className="underline">
              {attachment.url}
            </a>
          </div>
        </div>
        : <>
          <div className="my-3">
            {attachment.description ? attachment.description : 'No description.'}
          </div>
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


      <button id={attachment.id.toString()}
        data-cy={`attachment-remove-${attachment.id.toString()}`}
        onClick={removeAttachment} className="mt-6 flex p-2 bg-red-100 hover:bg-red-400 border-2 border-red-500 rounded-md gap-3" >
        <Image src={deleteIcon} width="24" height="24" alt="Icon to edit the name" />
        <div>Remove attachment</div>
      </button>

    </div>
  );

};

export default AttachmentItem;
