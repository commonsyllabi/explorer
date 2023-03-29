import React, { useMemo, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Row, Col, Spinner, Alert } from "react-bootstrap";
import { FiCheckCircle, FiFile, FiXCircle } from "react-icons/fi";
import { Session } from "next-auth";

// import global styles

const baseStyle: React.CSSProperties = {
  flex: 1,
  display: "flex",
  alignItems: "center",
  justifyItems: "center",
  padding: "16px",
  borderWidth: 2,
  borderRadius: 2,
  borderColor: "#eeeeee",
  borderStyle: "dashed",
  backgroundColor: "#fafafa",
  color: "#bdbdbd",
  outline: "none",
  transition: "border .24s ease-in-out",
};

const baseStyleFormats: React.CSSProperties = {
  transition: "color .24s ease-in-out",
};

const focusedStyle = {
  borderColor: "#2196f3",
};

const acceptStyle = {
  borderColor: "#00e676",
};

const rejectStyle = {
  borderColor: "#ff1744",
};

const rejectStyleFormat = {
  color: "#ff1744",
};

export type DragAndDropSyllabusProps = {
  onSyllabusUpload: (data: any) => void;
  session: Session | null;
};

function DragAndDropSyllabus({
  onSyllabusUpload,
  session,
}: DragAndDropSyllabusProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showError, setShowError] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [File, setFile] = useState<File | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const handleDrop = async (acceptedFiles: File[]) => {
    setIsLoading(true);
    setShowError(false);
    setShowSuccess(false);
    setErrorMessage("");

    // check if user is logged in
    if (session == null || session.user == null) {
      setIsLoading(false);
      setShowError(true);
      setErrorMessage(
        `It seems you have been logged out. Please log in and try again.`
      );
      if (session == null) console.warn("No session found!");
      else console.warn("No user found in session!");
      return;
    }

    // Creating http request
    const postHeader = new Headers();
    postHeader.append("Authorization", `Bearer ${session.user.token}`);
    const endpoint = new URL(`syllabi/parse`, apiUrl);
    const body = new FormData();
    body.append("file", acceptedFiles[0]);
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: postHeader,
        body: body,
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      onSyllabusUpload(data);
      setShowSuccess(true);
    } catch (error) {
      console.error(error);
      setErrorMessage(
        "There was an error uploading the syllabus file. Please try again later."
      );
      setShowError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const {
    acceptedFiles,
    getRootProps,
    getInputProps,
    isFocused,
    isDragAccept,
    isDragReject,
  } = useDropzone({
    onDrop: handleDrop,
    multiple: false,
    accept: {
      "application/msword": [".doc", ".docx"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".doc", ".docx"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.template":
        [".doc", ".docx"],
      "application/pdf": [".pdf"],
    },
  });

  const style = useMemo(
    () => ({
      ...baseStyle,
      ...(isFocused ? focusedStyle : {}),
      ...(isDragAccept ? acceptStyle : {}),
      ...(isDragReject ? rejectStyle : {}),
    }),
    [isFocused, isDragAccept, isDragReject]
  );

  const styleAcceptedFormats = useMemo(
    () => ({
      ...baseStyleFormats,
      ...(isDragReject ? rejectStyleFormat : {}),
    }),
    [isDragReject]
  );

  return (
    <Row {...getRootProps({ style })}>
      <input {...getInputProps()} />
      <Col className="col-1" style={{ fontSize: "32px" }}>
        {isLoading ? (
          <Spinner animation="border" />
        ) : showSuccess ? (
          // show checkmark
          <FiCheckCircle />
        ) : showError ? (
          <FiXCircle />
        ) : (
          <FiFile />
        )}
      </Col>
      <Col className="">
        <p className="m-0">
          Drag and drop a syllabus file here, or click to select a file.
        </p>
        <p className="m-0 small">
          Accepted file types:{" "}
          <span style={styleAcceptedFormats}>DOC, DOCX, PDF.</span>
        </p>
        {showError && <p className="m-0 small">{errorMessage}</p>}
      </Col>
      {/* {showError && (
        <Alert variant="danger" onClose={() => setShowError(false)} dismissible>
          <Alert.Heading>Error!</Alert.Heading>
          <p>
            There was an error uploading the syllabus file. Please try again
            later.
          </p>
        </Alert>
      )} */}
    </Row>
  );
}

export default DragAndDropSyllabus;
