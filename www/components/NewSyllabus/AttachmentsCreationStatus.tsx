import * as React from "react";

interface AttachmentsCreationStatusProps {
  status: string;
}

const AttachmentsCreationStatus: React.FunctionComponent<
  AttachmentsCreationStatusProps
> = ({ status }) => {
  switch (status) {
    case "pending":
      return (
        <li>
          <em>Uploading attachments...</em>
        </li>
      );
    case "created":
      return <li>Attachements uploaded.</li>;
    case "failed":
      return <li>Error adding attachments.</li>;
    default:
      return <></>;
  }
};

export default AttachmentsCreationStatus;
