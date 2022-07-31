import * as React from "react";
import Link from "next/link";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import SyllabusSchoolCodeYear from "components/Syllabus/SyllabusSchoolCodeYear";

interface ISyllabusCardProps {}

const SyllabusCard: React.FunctionComponent<ISyllabusCardProps> = (props) => {
  return (
    <Card>
      <Card.Body>
        <SyllabusSchoolCodeYear
          institution="Parson The New School of Design"
          code="PSAM1028"
          year="Spring 2019"
        />
        <Card.Title>
          <Link href="/syllabus">Web Design Basics</Link>
        </Card.Title>
        <p className="course-instructors">Pat Shiu</p>
        <Card.Text className="course-description">
          Web Design Basics is designed to introduce students to programming as
          a creative medium—as a way of making and exploring. The coursework
          focuses on developing a vocabulary of interaction design principles
          which can then be applied across a range of platforms. Students are
          encouraged to experiment with various media, tools, and techniques,
          ultimately producing a portfolio of interactive and visual projects
          designed for the screen. An emphasis is placed on typography as it
          applies to a screen context, research-based problem solving and a
          “learning through making” approach to technical skill building.
          Historical and current interaction design precedents will be
          discussed.
        </Card.Text>
        <div className="course-tags d-flex gap-2">
          <Button className="btn-sm btn-tag">web design</Button>
          <Button className="btn-sm btn-tag">foundation</Button>
          <Button className="btn-sm btn-tag">undergraduate</Button>
        </div>
      </Card.Body>
    </Card>
  );
};

export default SyllabusCard;
