import * as React from "react";
import Link from "next/link";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import SyllabusSchoolCodeYear from "components/Syllabus/SyllabusSchoolCodeYear";
import PubBadge from "./PubBadge";

interface ICollectionCardProps {}

const CollectionCard: React.FunctionComponent<ICollectionCardProps> = (
  props
) => {
  return (
    <Card>
      <Card.Body>
        <Card.Title>
          <Link href="user/a-collection">
            <a>Web Design Courses</a>
          </Link>
          <PubBadge isPublic={true} />
        </Card.Title>
        <p className="collection-meta small">
          collection by Pat Shiu | contains 12 syllabi
        </p>
        <Card.Text className="course-description">
          Lorem ipsum a collection about web design, with discussions on
          historical and current interaction design precedents.
        </Card.Text>
        <div className="collection-tags d-flex gap-2">
          <Button variant="outline-dark" className="btn-sm btn-tag">
            web design
          </Button>
          <Button variant="outline-dark" className="btn-sm btn-tag">
            foundation
          </Button>
          <Button variant="outline-dark" className="btn-sm btn-tag">
            undergraduate
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
};

export default CollectionCard;
