import React, { useMemo, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Row, Col, Spinner, Alert } from "react-bootstrap";

// import global styles

const baseStyle: React.CSSProperties = {
  flex: 1,
  display: "flex",
  flexDirection: "column",
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

type DragAndDropSyllabusProps = {
  onSyllabusUpload: (data: any) => void;
};

function DragAndDropSyllabus(props: DragAndDropSyllabusProps) {
  const { onSyllabusUpload } = props;
  const [isLoading, setIsLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleDrop = (files: File[]) => {
    const reader = new FileReader();
    reader.onload = async () => {
      const fileContent = reader.result as string;
      await sendFileToAPI(fileContent);
    };
    reader.readAsBinaryString(files[0]);
  };

  const { getRootProps, getInputProps, isFocused, isDragAccept, isDragReject } =
    useDropzone({
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

  const sendFileToAPI = async (fileContent: string) => {
    setIsLoading(true);
    setShowAlert(false);
    setShowSuccess(false);

    const url = process.env.OPENSYLLABUS_PARSER_API_URL || "No URL Found";
    const token = process.env.OPENSYLLABUS_PARSER_API_TOKEN;
    const headers = { Authorization: `Token ${token}` };

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          ...headers,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fileContent }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      onSyllabusUpload(data);
      setShowSuccess(true);
    } catch (error) {
      console.error(error);
      setShowAlert(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div {...getRootProps({ style })}>
      <input {...getInputProps()} />

      {isLoading ? (
        <Spinner animation="border" />
      ) : (
        <div>
          <p className="m-0">
            Drag and drop a syllabus file here, or click to select a file.
          </p>
          <p className="m-0 small">
            Accepted file types:{" "}
            <span style={styleAcceptedFormats}>DOC, DOCX, PDF.</span>
          </p>
        </div>
      )}
      {showAlert && (
        <Alert variant="danger" onClose={() => setShowAlert(false)} dismissible>
          <Alert.Heading>Error!</Alert.Heading>
          <p>
            There was an error uploading the syllabus file. Please try again
            later.
          </p>
        </Alert>
      )}
      {showSuccess && (
        <Alert
          variant="success"
          onClose={() => setShowSuccess(false)}
          dismissible
        >
          <Alert.Heading>Success!</Alert.Heading>
          <p>The syllabus file was uploaded successfully.</p>
        </Alert>
      )}
    </div>
  );
}

export default DragAndDropSyllabus;
