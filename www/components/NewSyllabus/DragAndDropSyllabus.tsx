import React, { useMemo, useState } from "react";
import { useDropzone } from "react-dropzone";
import { FiCheckCircle, FiFile, FiXCircle } from "react-icons/fi";
import { Session } from "next-auth";
import { IFormDataOptional } from "types";

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
  setParsedData: React.Dispatch<
    React.SetStateAction<IFormDataOptional | undefined>
  >;
  setParsedFile: React.Dispatch<React.SetStateAction<File | undefined>>;
  session: Session | null;
};

function DragAndDropSyllabus({
  setParsedData,
  setParsedFile,
  session,
}: DragAndDropSyllabusProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showError, setShowError] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [message, setMessage] = useState("");
  const [File, setFile] = useState<File | null>(null);

  const handleDrop = async (acceptedFiles: File[]) => {
    if(acceptedFiles.length == 0 || acceptedFiles[0].size * 0.000001 > 10){
      setShowError(true)
      setMessage("The file you are trying to upload is too large!")
      return
    }
    setIsLoading(true);
    setMessage("");
    setShowError(false);
    setShowSuccess(false);

    // Make sure the document is a PDF or a Word document

    // check if user is logged in
    if (session == null || session.user == null) {
      setIsLoading(false);
      setShowError(true);
      setMessage(
        `It seems you have been logged out. Please log in and try again.`
      );
      if (session == null) console.warn("No session found!");
      else console.warn("No user found in session!");
      return;
    }

    // Creating http request
    const postHeader = new Headers();
    postHeader.append("Authorization", `Bearer ${session.user.token}`);
    const endpoint = new URL(`syllabi/parse`, process.env.NEXT_PUBLIC_API_URL);
    const body = new FormData();
    body.append("file", acceptedFiles[0]);
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: postHeader,
        body: body,
      });
      if (!res.ok) {
        const errorResponse = await res.text();
        throw new Error(errorResponse);
      }
      const data: IFormDataOptional = await res.json();
      setParsedData(data);
      setParsedFile(acceptedFiles[0]);
      setShowSuccess(true);
      setMessage("Syllabus file uploaded successfully!");
    } catch (error: any) {
      console.error(error);
      setMessage(
        error.message || error.toString() || "An unknown error occurred, please try again later."
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
    <>
      <div {...getRootProps({ style })}>
        <input {...getInputProps()} />
        <div style={{ fontSize: "32px", width: "32px", marginRight: "16px" }}>
          {isLoading ? (
            '...'
          ) : showSuccess ? (
            // show checkmark
            <FiCheckCircle />
          ) : showError ? (
            <FiXCircle />
          ) : (
            <FiFile />
          )}
        </div>
        <div>
          <p className="m-0">
            Drag and drop a syllabus file here, or click to select a file.
          </p>
          <p className="m-0 small">
            Accepted file types:{" "}
            <span style={styleAcceptedFormats}>DOC, DOCX, PDF.</span>
          </p>
        </div>
      </div>
      <p className={`small p-2 ${showError ? "text-red-600 font-bold" : ""}`}>
        {message}
      </p>
    </>
  );
}

export default DragAndDropSyllabus;
