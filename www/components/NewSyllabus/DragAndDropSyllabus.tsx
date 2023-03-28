import React, { useState } from "react";
import { useDropzone } from "react-dropzone";
import { Spinner } from "react-bootstrap";

type DragAndDropSyllabusProps = {
  onSyllabusUpload: (data: any) => void;
};

function DragAndDropSyllabus(props: DragAndDropSyllabusProps) {
  const { onSyllabusUpload } = props;
  const [isLoading, setIsLoading] = useState(false);

  const handleDrop = (files: File[]) => {
    setIsLoading(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const fileContent = reader.result as string;
      await sendFileToAPI(fileContent);
      setIsLoading(false);
    };
    reader.readAsBinaryString(files[0]);
  };

  const { getRootProps, getInputProps } = useDropzone({
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

  const sendFileToAPI = async (fileContent: string) => {
    const url = process.env.OPENSYLLABUS_PARSER_API_URL || "No URL Found";
    const token = process.env.OPENSYLLABUS_PARSER_API_TOKEN;
    const headers = { Authorization: `Bearer ${token}` };

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
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div {...getRootProps({ className: "dropzone" })}>
      <input {...getInputProps()} />
      <p>Drag and drop a syllabus file here, or click to select a file.</p>
      {isLoading && <Spinner animation="border" />}
    </div>
  );
}

export default DragAndDropSyllabus;
