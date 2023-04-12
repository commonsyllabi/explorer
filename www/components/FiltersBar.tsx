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

const FiltersBar: React.FunctionComponent<syllabiFiltersProps> = (props) => {
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
  

  const handleChange = (e: React.SyntheticEvent) => {
    const t = e.target as HTMLInputElement    
    setFilters({ ...filters, [t.id]: t.value })
  }

  const handleReset = (e: React.SyntheticEvent) => {
    setFilters({
      academic_level: "",
      academic_field: "",
      academic_year: "",
      language: "",
      tags_include: [],
      tags_exclude: [],
    })
  }

  return (
    <Container className="py-3 flex flex-column gap-3">
      {/* FILTER BY ACAD LEVEL */}
      <div>
        <Form.Group>
          <Form.Label className="small">Academic Level</Form.Label>
          <Form.Select
            id="academic_level"
            value={filters.academic_level}
            data-cy="filtersAcademicLevel"
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
          <Form.Select
            id="academic_year"
            value={filters.academic_year}
            data-cy="filtersAcademicYear"
            onChange={handleChange}>
            <option value="">All</option>
            {getYearsFilters(props.meta.academic_years)}
          </Form.Select>
        </Form.Group>
      </div>

      {/* FILTER BY ACADEMIC FIELDS */}
      <div>
        <Form.Group>
          <Form.Label className="small">Academic Field</Form.Label>
          <Form.Select
            id="academic_field"
            value={filters.academic_field}
            data-cy="filtersAcademicField"
            onChange={handleChange}>
            <option value="">All</option>
            {getFieldsFilters(props.meta.academic_fields)}
          </Form.Select>
        </Form.Group>
      </div>

      {/* FILTER BY LANGUAGE */}
      <div>
        <Form.Group>
          <Form.Label className="small">Language / Region</Form.Label>
          <Form.Select
            id="language"
            value={filters.language}
            data-cy="filtersLanguage"
            onChange={handleChange}>
            <option value="">All</option>
            {getLanguagesFilters(props.meta.languages)}
          </Form.Select>
        </Form.Group>
      </div>

      {/* FILTER BY TAGS */}
      <div>
        <div className="flex justify-content-between align-items-baseline">
          <h3 className="small">Filter by Tags</h3>
        </div>
        <div id="tag-search-inputs">
          <div>
            <Form>
              <label className="small" id="search-includes-tags">
                <strong>Include</strong> courses with these tags:
              </label>
              <InputGroup>
                <Form.Control
                  as="textarea"
                  aria-labelledby="search-includes-tags"
                  id="tags_include"
                  value={filters.tags_include}
                  data-cy="filtersTagsInclude"
                  onChange={handleChange}
                />
              </InputGroup>
            </Form>
          </div>
          <div>
            <Form>
              <label className="small" id="search-excludes-tags">
                <strong>Exclude</strong> courses with these tags:
              </label>
              <InputGroup>
                <Form.Control
                  as="textarea"
                  aria-labelledby="search-excludes-tags"
                  id="tags_exclude"
                  value={filters.tags_exclude}
                  data-cy="filtersTagsExclude"
                  onChange={handleChange}
                />
              </InputGroup>
            </Form>
          </div>

          <div>
            <Button onClick={handleReset} className="mt-4 w-100" variant="light" data-cy="filtersReset">Reset filters</Button>
          </div>
        </div>
      </div>
    </Container>
  );
};

export default FiltersBar;
