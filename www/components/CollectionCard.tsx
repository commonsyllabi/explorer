import * as React from "react";
import Link from "next/link";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import PubBadge from "./PubBadge";
import { getIsPublic } from "components/utils/getIsPublic";
import Tags from "./Tags";
import { getUserUrl } from "./utils/getLinks";

interface ICollectionCardProps {
  uuid: string;
  name: string;
  status: string;
  description?: string;
  tags?: string[];
  userName: string;
  userUuid: string;
  syllabiCount?: number;
  isAdmin: boolean;
}

const CollectionCard: React.FunctionComponent<ICollectionCardProps> = (
  props
) => {
  return (
    <Card>
      <Card.Body>
        <Card.Title>
          <Link href={`/collections/${props.uuid}`}>
            <a>{props.name}</a>
          </Link>
          {props.isAdmin ? (
            <PubBadge isPublic={getIsPublic(props.status)} />
          ) : null}
        </Card.Title>
        <p className="collection-meta small">
          collection by{" "}
          <Link href={getUserUrl(props.userUuid)}>{props.userName}</Link> |
          contains {props.syllabiCount} syllabi
        </p>
        <Card.Text className="course-description">
          {props.description}
        </Card.Text>
        <Tags tags={props.tags} />
      </Card.Body>
    </Card>
  );
};

export default CollectionCard;
