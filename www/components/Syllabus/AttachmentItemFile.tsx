import * as React from "react";

import { Badge, Button, Card } from "react-bootstrap";

interface IAttachmentItemFileProps {
  name: string;
  size?: string;
  type?: string;
  url?: string;
}

const AttachmentItemFile: React.FunctionComponent<IAttachmentItemFileProps> = (
  fileData
) => {
  return (
    <>
      <Card className="mb-3">
        <Card.Body>
          <Card.Title>{fileData.name}</Card.Title>
          <p className="small text-muted">file name: {fileData.name}</p>
          <p className="small text-muted">url: {fileData.url}</p>
          <div>
            <p className="small text-muted mb-0">Description:</p>
            <p>This is some text within a card body.</p>
          </div>
          <div className="d-flex gap-2">
            <p className="small">
              <span className="text-muted">Size:</span> {fileData.size} Mb
            </p>
            <p className="small">|</p>
            <p className="small">
              <span className="text-muted">Type:</span>{" "}
              <Badge bg="secondary">{fileData.type}</Badge>
            </p>
          </div>
          <Button variant="danger">Delete</Button>
        </Card.Body>
      </Card>
    </>
  );
};

export default AttachmentItemFile;
