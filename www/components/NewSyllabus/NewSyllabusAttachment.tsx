import React, { useEffect, useRef, useState } from "react";
import { IUploadAttachment } from "types";

interface INewSyllabusAttachmentProps {
  attachmentData: IUploadAttachment[];
  setAttachmentData: Function;
}

const NewSyllbusAttachment: React.FunctionComponent<
  INewSyllabusAttachmentProps
> = ({ attachmentData, setAttachmentData }) => {
  // Set up file data
  const fileRef = useRef<HTMLInputElement>(null)
  const blankAttachment: IUploadAttachment = {
    id: '0',
    name: "",
    description: "",
    file: undefined,
    size: "",
    url: "",
    type: "",
  };
  const [thisAttachment, setThisAttachment] = useState(blankAttachment);
  const [fileData, setFileData] = useState({
    name: "",
    size: "",
    type: "",
  });

  const setNewId = () => {
    let currentGreatestId;
    if (attachmentData.length) {
      currentGreatestId = parseInt(attachmentData[attachmentData.length - 1].id) + 1;
    } else {
      currentGreatestId = 0;
    }
    setThisAttachment({ ...blankAttachment, id: currentGreatestId.toString() });
    if(fileRef.current)
      fileRef.current.value = ""
  };

  // For togging between file and url upload UI
  const [showFileUI, setShowFileUI] = useState(true);
  const toggleUI = () => {
    if (showFileUI) {
      //reset the file/url fields of any old data upon toggle
      setThisAttachment({
        ...thisAttachment,
        type: "url",
        url: "",
        file: undefined,
        size: "",
      });
      setShowFileUI(false); //TODO: changing state of showFileUI causes warning on radio button component, value undefined at some point?
    } else {
      //reset the file/url fields of any old data upon toggle
      setThisAttachment({
        ...thisAttachment,
        type: "file",
        url: "",
        file: undefined,
        size: "",
      });
      setShowFileUI(true);
    }
  };

  const handleChange = (event: React.SyntheticEvent) => {
    const t = event.target as HTMLInputElement;
    setThisAttachment({ ...thisAttachment, [t.id]: t.value });
  };

  const handleAttachmentFile = (e: React.BaseSyntheticEvent): void => {
    e.preventDefault();
    e.stopPropagation()

    const t = e.target as HTMLInputElement;
    if (t.files == null) return;

    const f = t.files[0] as File;
    setThisAttachment({
      ...thisAttachment,
      file: f,
      size: (f.size * 0.000001).toFixed(2), //-- from byte to megabyte});
      type: f.type,
    });

    setFileData({
      name: f.name,
      size: (f.size * 0.000001).toFixed(2), //-- from byte to megabyte
      type: f.type,
    });
  };

  const handleSubmitNewAttachment = (e: React.BaseSyntheticEvent): void => {
    e.preventDefault()
    e.stopPropagation()
    
    setAttachmentData([...attachmentData, thisAttachment]);
  };

    //After new attachment is added to attachmentData, reset form
    useEffect(() => {
      setNewId();
    }, [attachmentData]);

  return (
    <>
      <div className="flex flex-col p-3 mb-3 gap-4 border-2 rounded-lg bg-gray-200">
        <div>
          <label>Name*</label>
          <input
            onChange={handleChange}
            type="text"
            className="bg-transparent mt-2 py-1 border-b-2 border-b-gray-900 w-full"
            id="name"
            placeholder="required"
            value={thisAttachment.name}
            data-cy="new-attachment-name"
          />
        </div>

        <div>
          <label>Description</label>
          <textarea
            onChange={handleChange}
            className="bg-transparent mt-2 p-1 border border-gray-900 w-full"
            id="description"
            placeholder="optional"
            value={thisAttachment.description}
            rows={2}
            data-cy="new-attachment-description"
          />
        </div>

        <div className="flex pt-3 pb-2 gap-3">
          <label>Type:</label>
          <input
            type="radio"
            id="typeFile"
            name="attachmentType"
            onChange={toggleUI}
            data-cy={"new-attachment-type-file"}
            defaultChecked={true}
          />
          <label htmlFor="attachmentType">File</label>
          <input
            type="radio"
            id="typeUrl"
            name="attachmentType"
            onChange={toggleUI}
            data-cy={"new-attachment-type-url"}
          />
          <label htmlFor="attachmentType">URL</label>
        </div>
        {showFileUI ? (
          <div id="uploadControlsFile" className="flex flex-col my-6">
            
              <label>Upload your file here:</label>
              <input
                onChange={handleAttachmentFile}
                type="file"
                ref={fileRef}
                className="mt-2 py-1"
                id="file"
                data-cy={"new-attachment-file"}
              />
            
          </div>
        ) : (
          <div id="uploadControlsUrl">
            <div>
              <label>Enter your URL here</label>
              <input
                onChange={handleChange}
                type="url"
                className="bg-transparent mt-2 py-1 border-b-2 border-b-gray-900 w-full"
                id="url"
                value={thisAttachment.url}
                data-cy={"new-attachment-url"}
              />
            </div>
          </div>
        )}
        <button
          onClick={handleSubmitNewAttachment}
          data-cy="attachment-add"
          className="mt-6 mb-2 p-2 bg-gray-50 text-gray-900 border border-gray-900 rounded-md"
        >
          Add attachment
        </button>
      </div>
    </>
  );
};

export default NewSyllbusAttachment;
