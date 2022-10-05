import * as React from "react";
import { Container } from "react-bootstrap";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import { ISyllabiFilters } from "../types"

interface syllabiFiltersProps {
  updateFilters: (filters: ISyllabiFilters) => void
}

const TagsFiltersBar: React.FunctionComponent<syllabiFiltersProps> = (props) => {
  const [filters, setFilters] = React.useState<ISyllabiFilters>({
    academic_level: "",
    academic_field: "",
    academic_year: "",
    language: "",
    tags_include: [],
    tags_exclude: [],
  })

  React.useEffect(() => {
    props.updateFilters(filters)
  }, [filters])

  const handleChange = (event: React.SyntheticEvent) => {
    const t = event.target as HTMLInputElement
    setFilters({ ...filters, [t.id]: t.value })
  }

  return (
    <Container className="py-3 d-flex flex-column gap-3">
      {/* FILTER BY ACAD LEVEL */}
      <div>
        <Form.Group>
          <Form.Label className="small">Academic Level</Form.Label>
          <Form.Select
            id="academic_level"
            onChange={handleChange}>
            <option value="">All</option>
            <option value="0">Other</option>
            <option value="1">Bachelor</option>
            <option value="2">Master</option>
            <option value="3">Doctoral</option>
          </Form.Select>
        </Form.Group>
      </div>

      {/* FILTER BY ACADEMIC TERM */}
      <div>
        <Form.Group>
          <Form.Label className="small">Academic Year</Form.Label>
          <Form.Select id="academic_year" onChange={handleChange}>
            <option value="">All</option>
            <option value="2016">2016</option>
            <option value="2017">2017</option>
            <option value="2018">2018</option>
            <option value="2019">2019</option>
            <option value="2020">2020</option>
            <option value="2021">2021</option>
            <option value="2022">2022</option>
          </Form.Select>
        </Form.Group>
      </div>

      {/* FILTER BY ACADEMIC FIELDS */}
      <div>
        <Form.Group>
          <Form.Label className="small">Academic Field</Form.Label>
          <Form.Select id="academic_field" onChange={handleChange}>
            <option value="">All</option>
          </Form.Select>
        </Form.Group>
      </div>

      {/* FILTER BY LANGUAGE */}
      <div>
        <Form.Group>
          <Form.Label className="small">Language / Region</Form.Label>
          <Form.Select id="language" onChange={handleChange}>
            <option value="">All</option>
            <option value="en">English</option>
            <option value="fr">French</option>
            <option value="de">German</option>
          </Form.Select>
        </Form.Group>
      </div>

      {/* FILTER BY TAGS */}
      <div>
        <div className="d-flex justify-content-between align-items-baseline">
          <h3 className="small">Filter by Tags</h3>
          <Button variant="link" aria-label="Close">
            close
          </Button>
        </div>
        <div id="tag-search-inputs">
          <div>
            <Form>
              <label className="small" id="search-includes-tags">
                <strong>Include</strong> courses with these words:
              </label>
              <InputGroup>
                <Form.Control
                  as="textarea"
                  aria-labelledby="search-includes-tags"
                  id="tags_include"
                  onChange={handleChange}
                />
              </InputGroup>
            </Form>
          </div>
          <div>
            <Form>
              <label className="small" id="search-excludes-tags">
                <strong>Exclude</strong> courses with these words:
              </label>
              <InputGroup>
                <Form.Control
                  as="textarea"
                  aria-labelledby="search-excludes-tags"
                  id="tags_exclude"
                  onChange={handleChange}
                />
              </InputGroup>
            </Form>
          </div>
        </div>
      </div>
    </Container>
  );
};

export default TagsFiltersBar;
