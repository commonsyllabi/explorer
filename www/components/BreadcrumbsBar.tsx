import Container from "react-bootstrap/Container";
import Link from "next/link";
import Dropdown from "react-bootstrap/Dropdown";

interface IBreadcrumbsBarProps {
  user: string;
  userId: string;
  category: string;
  pageTitle: string;
}
export const BreadcrumbsBar: React.FunctionComponent<IBreadcrumbsBarProps> = (
  props
) => {
  const getCategoryLink = (props: IBreadcrumbsBarProps) => {
    if (props.category === "collections") {
      return (
        <>
          /{" "}
          <Link href={`/user/${props.userId}/?tab=collections`}>
            <a className="text-muted">{props.category}</a>
          </Link>
        </>
      );
    }
    return (
      <Link href={`/user/${props.userId}`}>
        <a className="text-muted">{props.category}</a>
      </Link>
    );
  };
  return (
    <Container className="border-bottom">
      <div className="pt-3 d-grid gap-2 d-flex justify-content-between align-items-baseline">
        <div className="breadcrumbs d-flex">
          <p className="small">
            <Link href={`/user/${props.userId}`}>
              <a className="text-muted">@{props.user}</a>
            </Link>
            &nbsp;
          </p>
          <p className="small">{getCategoryLink(props)}</p>
          <p className="small">&nbsp;/&nbsp;{props.pageTitle}</p>
        </div>
      </div>
    </Container>
  );
};
