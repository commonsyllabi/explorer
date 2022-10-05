import * as React from "react";
import { Container } from "react-bootstrap";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import { ISyllabiFilters, IMetaInformation } from "../types"
import { getFieldsFilters, getLanguagesFilters, getLevelsFilters, getYearsFilters } from "./utils/getSearchFilters";

interface syllabiFiltersProps {
  updateFilters: (filters: ISyllabiFilters) => void;
  meta: IMetaInformation
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

  //-- todo : generate the options dropdown html given the meta props (might be annoying to deal with fields and levels)
  

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
            {getLevelsFilters(props.meta.academic_levels)}
          </Form.Select>
        </Form.Group>
      </div>

      {/* FILTER BY ACADEMIC TERM */}
      <div>
        <Form.Group>
          <Form.Label className="small">Academic Year</Form.Label>
          <Form.Select id="academic_year" onChange={handleChange}>
            <option value="">All</option>
            {getYearsFilters(props.meta.academic_years)}
          </Form.Select>
        </Form.Group>
      </div>

      {/* FILTER BY ACADEMIC FIELDS */}
      <div>
        <Form.Group>
          <Form.Label className="small">Academic Field</Form.Label>
          <Form.Select id="academic_field" onChange={handleChange}>
            <option value="">All</option>
            {getFieldsFilters(props.meta.academic_fields)}
          </Form.Select>
        </Form.Group>
      </div>

      {/* FILTER BY LANGUAGE */}
      <div>
        <Form.Group>
          <Form.Label className="small">Language / Region</Form.Label>
          <Form.Select id="language" onChange={handleChange}>
            <option value="">All</option>
            {getLanguagesFilters(props.meta.languages)}
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
