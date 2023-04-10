import Container from "react-bootstrap/Container";
import Link from "next/link";
import Dropdown from "react-bootstrap/Dropdown";

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
          <Link href={`/user/${props.userId}/?tab=collections`} className="text-muted">
            {props.category}
          </Link>
        </>
      );
    }
    return (
      <>
        /{" "}
        <Link href={`/user/${props.userId}`} className="text-muted">
          {props.category}
        </Link>
      </>
    );
  };
  return (
    <Container fluid className="border-bottom">
      <div className="pt-3 d-grid gap-2 d-flex justify-content-between align-items-baseline">
        <div className="breadcrumbs d-flex">
          <p className="small">
            <Link href={`/user/${props.userId}`} className="text-muted">
              @{props.user}
            </Link>
            &nbsp;
          </p>
          <p className="small">{getCategoryLink(props)}</p>
          <p className="small">&nbsp;/&nbsp;{props.pageTitle}</p>
        </div>

        <div className="d-flex gap-4">
          <p className="small text-muted">Flag</p>
          {props.category === "syllabi" ? (
            <p className="small text-muted">Add to Collection</p>
          ) : null}
        </div>
      </div>
    </Container>
  );
};

export default BreadcrumbsBar;
