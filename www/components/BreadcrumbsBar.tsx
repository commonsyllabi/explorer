import Link from "next/link";

interface IBreadcrumbsBarProps {
  user: string;
  userId: string;
  category: string;
  pageTitle: string;
}

const BreadcrumbsBar: React.FunctionComponent<IBreadcrumbsBarProps> = (
  props
) => {
  const getCategoryLink = (props: IBreadcrumbsBarProps) => {
    if (props.category === "collections") {
      return (
        <>
          /{" "}
          <Link href={`/user/${props.userId}/?tab=collections`} className="text-gray-600 hover:underline">
            {props.category}
          </Link>
        </>
      );
    }
    return (
      <>
        /{" "}
        <Link href={`/user/${props.userId}`} className="text-gray-600 hover:underline">
          {props.category}
        </Link>
      </>
    );
  };
  return (
    <div className="border-bottom">
      <div className="pt-3 d-grid gap-2 flex justify-content-between align-items-baseline">
        <div className="breadcrumbs flex">
          <p className="small">
            <Link href={`/user/${props.userId}`} className="text-gray-600 hover:underline">
              @{props.user}
            </Link>
            &nbsp;
          </p>
          <p className="small">{getCategoryLink(props)}</p>
          <p className="small">&nbsp;/&nbsp;{props.pageTitle}</p>
        </div>

        <div className="flex gap-4">
          {props.category === "syllabi" ? (
            <p className="small text-gray-600 hover:underline">Add to Collection</p>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default BreadcrumbsBar;
