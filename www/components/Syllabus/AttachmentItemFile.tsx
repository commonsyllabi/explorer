import * as React from "react";
import Link from "next/link";
import { Badge, Button, Card } from "react-bootstrap";

// interface IAttachmentItemFileProps {
//   name: string;
//   size?: string;
//   type?: string;
//   url?: string;
// }

const AttachmentItemFile: React.FunctionComponent<IUploadAttachment> = ({
  attachment,
}) => {
  return (
    <>
      <Card className="mb-3">
        <Card.Body>
          <Card.Title>{attachment.name}</Card.Title>
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
          <p className="small text-muted m-0">file id: {attachment.id}</p>
          <p className="small text-muted">
            url:{" "}
            <a href={attachment.url} target="_blank">
              {attachment.url}
            </a>
          </p>

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
          <Button variant="danger">Delete</Button>
        </Card.Body>
      </Card>
    </>
  );
};

export default AttachmentItemFile;
