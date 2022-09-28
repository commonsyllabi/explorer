import * as React from "react";
import { Badge, Button, Card } from "react-bootstrap";

import { IUploadAttachment } from "types";

interface IAttachmentItemFileProps {
  attachment: IUploadAttachment;
  attachmentData: IUploadAttachment[];
  setAttachmentData: Function;
}

const AttachmentItemFile: React.FunctionComponent<IAttachmentItemFileProps> = ({
  attachment,
  attachmentData,
  setAttachmentData,
}) => {
  const removeAttachment = (event: React.SyntheticEvent) => {
    const t = event.target as HTMLInputElement;
    let keepTheseAttachments = attachmentData.filter((attachment) => {
      return attachment.id != parseInt(t.id);
    });
    setAttachmentData(keepTheseAttachments);
    // console.log(`REMOVE ME!!!!`);
  };

  if (attachment.type === "url") {
    return (
      <>
        <Card className="mb-3">
          <Card.Body>
            <Card.Title>
              {attachment.name} ({attachment.id})
            </Card.Title>
            <div>
              <p>
                <a href={attachment.url} target="_blank" rel="noreferrer">
                  {attachment.url}
                </a>
              </p>
              <p className="small text-muted mb-0">Description:</p>
              {attachment.description ? (
                <p>{attachment.description}</p>
              ) : (
                <p className="text-muted">
                  <em>No description.</em>
                </p>
              )}
            </div>
            <Button
              variant="danger"
              size="sm"
              id={attachment.id.toString()}
              onClick={removeAttachment}
            >
              Delete
            </Button>
          </Card.Body>
        </Card>
      </>
    );
  } else {
    return (
      <>
        <Card className="mb-3">
          <Card.Body>
            <Card.Title>
              {attachment.name} ({attachment.id})
            </Card.Title>
            <div>
              <p className="small text-muted mb-0">Description:</p>
              {attachment.description ? (
                <p>{attachment.description}</p>
              ) : (
                <p className="text-muted">
                  <em>No description.</em>
                </p>
              )}
            </div>
            <div className="d-flex gap-2">
              <p className="small">
                <span className="text-muted">Size:</span> {attachment.size} Mb
              </p>
              <p className="small">|</p>
              <p className="small">
                <span className="text-muted">Type:</span>{" "}
                <Badge bg="secondary">{attachment.type}</Badge>
              </p>
            </div>
            <Button
              variant="danger"
              size="sm"
              id={attachment.id.toString()}
              onClick={removeAttachment}
            >
              Delete
            </Button>
          </Card.Body>
        </Card>
      </>
    );
  }
};

export default AttachmentItemFile;
