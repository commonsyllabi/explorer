import Link from "next/link";
import * as React from "react";
import Button from "react-bootstrap/Button";

interface ITagsProps {
  tags: string[] | undefined;
}

const Tags: React.FunctionComponent<ITagsProps> = ({ tags }) => {
  if (tags) {
    const tagEls = tags.map((tagContent) => (
      <Link key={`${tagContent}-tag-link`} href={`/?tags=${tagContent}`}>
        <button className="rounded-lg bg-gray-300 text-gray-900 px-2 py-1" key={tagContent}>
          {tagContent}
        </button>
      </Link>
    ));
    return <>{tagEls}</>;
  }

  return null;
};

export default Tags;
