import * as React from "react";
import Link from "next/link";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import SyllabusSchoolCodeYear from "components/Syllabus/SyllabusSchoolCodeYear";
import PubBadge from "./PubBadge";
import { getIsPublic } from "pages/utils/getIsPublic";
import Tags from "./Tags";

interface ICollectionCardProps {
  uuid: string;
  name: string;
  status: string;
  description?: string;
  tags?: string[];
  userName: string;
  userUuid: string;
  syllabiCount?: number;
}

const CollectionCard: React.FunctionComponent<ICollectionCardProps> = (
  props
) => {
  return (
    <Card>
      <Card.Body>
        <Card.Title>
          <Link href={`/collection/${props.uuid}`}>
            <a>{props.name}</a>
          </Link>
          <PubBadge isPublic={getIsPublic(props.status)} />
        </Card.Title>
        <p className="collection-meta small">
          collection by{" "}
          <Link href={`user/${props.userUuid}`}>{props.userName}</Link> |
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
