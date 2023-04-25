import Link from "next/link";

interface ITagsProps {
  tags: string[] | undefined;
}

const Tags: React.FunctionComponent<ITagsProps> = ({ tags }) => {
  if (tags) {
    const tagEls = tags.map((tagContent) => (
      <Link key={`${tagContent}-tag-link`} href={`/?tags=${tagContent}`} data-cy="course-tag">
        <button className="rounded-sm border border-gray-900 text-gray-900 px-3 py-1 text-sm" key={tagContent}>
          {tagContent}
        </button>
      </Link>
    ));
    return <div className="flex gap-2">{tagEls}</div>;
  }

  return <></>;
};

export default Tags;
