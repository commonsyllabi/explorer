import { Form, Button } from "react-bootstrap";
import { useEffect, useState } from "react";

import { IUploadAttachment } from "types";

interface INewSyllabusAttachmentProps {
  attachmentData: IUploadAttachment[];
  setAttachmentData: Function;
}

const NewSyllbusAttachment: React.FunctionComponent<
  INewSyllabusAttachmentProps
> = ({ attachmentData, setAttachmentData }) => {
  // Set up file data

  const blankAttachment: IUploadAttachment = {
    id: 0,
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
      currentGreatestId = attachmentData[attachmentData.length - 1].id + 1;
    } else {
      currentGreatestId = 0;
    }
    setThisAttachment({ ...blankAttachment, id: currentGreatestId });
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
    //console.log(JSON.stringify(thisAttachment));
    // console.log(`${[t.id]}: ${t.value}`);
  };

  const handleAttachmentFile = (event: React.SyntheticEvent): void => {
    event.preventDefault();

    const t = event.target as HTMLInputElement;
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

  const handleSubmitNewAttachment = (): void => {
    setAttachmentData([...attachmentData, thisAttachment]);
  };

  //After new attachment is added to attachmentData, reset form
  useEffect(() => {
    resetForm();
  }, [attachmentData]);

  useEffect(() => {
    console.log(`thisAttachment: ${JSON.stringify(thisAttachment)}`);
  }, [thisAttachment]);

  const resetForm = (): void => {
    // setThisAttachment(blankAttachment);
    setNewId();
    console.log(`Reset form called.`);
    console.log(`thisAttachment: ${JSON.stringify(thisAttachment)}`);
    // console.log(`blankAttachment: ${JSON.stringify(blankAttachment)}`);
  };

  return (
    <>
      <div className="p-3 mb-3 gap-3 border rounded bg-light">
        <p>Current Id: {thisAttachment.id}</p>
        <Form.Group className="mb-1">
          <Form.Label>Attachment Name*</Form.Label>
          <Form.Control
            onChange={handleChange}
            type="text"
            id="name"
            placeholder="required"
            value={thisAttachment.name}
            data-cy="new-attachment-name"
          />
        </Form.Group>

        <Form.Group>
          <Form.Label>Description</Form.Label>
          <Form.Control
            onChange={handleChange}
            type="text"
            id="description"
            placeholder="optional"
            value={thisAttachment.description}
            as="textarea"
            rows={2}
            data-cy="new-attachment-description"
          />
        </Form.Group>

        <Form.Group className="d-flex pt-3 pb-2 gap-3">
          <Form.Label>Attachment Type:</Form.Label>
          <Form.Check
            type="radio"
            label="file upload"
            id="typeFile"
            name="attachmentType"
            onChange={toggleUI}
            data-cy={"new-attachment-type-file"}
            defaultChecked={true}
          />
          <Form.Check
            type="radio"
            label="url"
            id="typeUrl"
            name="attachmentType"
            onChange={toggleUI}
            data-cy={"new-attachment-type-url"}
          />
        </Form.Group>
        {showFileUI ? (
          <div id="uploadControlsFile">
            <Form.Group>
              <Form.Label>Upload your file here</Form.Label>
              <Form.Control
                onChange={handleAttachmentFile}
                type="file"
                id="file"
                data-cy={"new-attachment-file"}
              />
            </Form.Group>
          </div>
        ) : (
          <div id="uploadControlsUrl">
            <Form.Group>
              <Form.Label>Enter your URL here</Form.Label>
              <Form.Control
                onChange={handleChange}
                type="text"
                id="url"
                // value={thisAttachment.url || ""}
                data-cy={"new-attachment-url"}
              />
            </Form.Group>
          </div>
        )}
        <Button
          type="button"
          onClick={handleSubmitNewAttachment}
          data-cy="attachment-add"
          className="mt-3 mb-2"
        >
          Add attachment
        </Button>
      </div>
    </>
  );
};

export default NewSyllbusAttachment;
