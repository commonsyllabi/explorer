import { Form, Button } from "react-bootstrap";
import { useState } from "react";

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
    id: attachmentData.length,
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

  // For togging between file and url upload UI
  const [showFileUI, setShowFileUI] = useState(true);
  const toggleUI = () => {
    if (showFileUI === true) {
      //reset the file/url fields of any old data upon toggle
      setThisAttachment({
        ...thisAttachment,
        type: "url",
        url: "",
        file: undefined,
        size: "",
      });
      setShowFileUI(false);
    } else {
      //reset the file/url fields of any old data upon toggle
      setThisAttachment({
        ...thisAttachment,
        type: "",
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
    console.log(`${[t.id]}: ${t.value}`);
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
    resetForm();
  };

  const resetForm = (): void => {
    setThisAttachment(blankAttachment);
  };

  return (
    <>
      <div className="p-3 mb-3 gap-3 border rounded bg-light">
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
            checked={showFileUI}
            onChange={toggleUI}
            data-cy={"new-attachment-type-file"}
          />
          <Form.Check
            type="radio"
            label="url"
            id="typeUrl"
            checked={!showFileUI}
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
                value={thisAttachment.url}
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
