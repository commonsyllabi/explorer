import * as React from "react";
import Button from "react-bootstrap/Button";

interface ITagsProps {
  tags: string[];
}

const Tags: React.FunctionComponent<ITagsProps> = (props) => {
  const tags = props.tags;
  const tagEls = tags.map((tagContent) => (
    <Button className="btn-sm btn-tag" key={tagContent}>
      {tagContent}
    </Button>
  ));
  return <>{tagEls}</>;
};

export default Tags;
