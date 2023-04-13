import * as React from "react";
import Link from "next/link";

interface ISyllabusFooterProps {
  author: string;
  authorUUID: string;
  uploadDate: string;
}

const SyllabusFooter: React.FunctionComponent<ISyllabusFooterProps> = ({
  author,
  authorUUID,
  uploadDate,
}) => {
  const readableDate = new Date(uploadDate).toString();
  const [weekday, month, day, year, ...theRest] = readableDate.split(" ");
  return (
    <div className="border-top py-3" id="footer">
      <div>
        <p className="small text-center">
          Uploaded by{" "}
          <Link href={`/user/${encodeURIComponent(authorUUID)}`} className="text-muted">
            {author}
          </Link>{" "}
          on {weekday} {month} {day} {year}
        </p>
      </div>
      <div>
        <p className="small text-center">flag for review</p>
      </div>
    </div>
  );
};

export default SyllabusFooter;
