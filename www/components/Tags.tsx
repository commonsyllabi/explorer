import Link from "next/link";
import * as React from "react";
import Button from "react-bootstrap/Button";

interface ITagsProps {
  tags: string[] | undefined;
}

const Tags: React.FunctionComponent<ITagsProps> = ({ tags }) => {
  if (tags) {
    const tagEls = tags.map((tagContent) => (
      <Link key={`${tagContent}-tag-link`} className="white" href={`/?tags=${tagContent}`}>
        <Button className="btn-sm btn-tag" key={tagContent}>
          {tagContent}
        </Button>
      </Link>
    ));
    return <>{tagEls}</>;
  }

  return null;
};

export default Tags;
