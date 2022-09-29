import * as React from "react";
import { Container } from "react-bootstrap";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";

const TagsFiltersBar: React.FunctionComponent = () => {
  return (
    <Container className="py-3 d-flex flex-column gap-3">
      {/* FILTER BY ACAD LEVEL */}
      <div>
        <Form.Group>
          <Form.Label className="small">Academic Level</Form.Label>
          <Form.Select id="academic_level_filter">
            <option value="all">All</option>
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
          <Form.Label className="small">Academic Term</Form.Label>
          <Form.Select id="academic_term_filter">
            <option value="all">All</option>
          </Form.Select>
        </Form.Group>
      </div>

      {/* FILTER BY ACADEMIC FIELDS */}
      <div>
        <Form.Group>
          <Form.Label className="small">Academic Field</Form.Label>
          <Form.Select id="academic_field_filter">
            <option value="all">All</option>
          </Form.Select>
        </Form.Group>
      </div>

      {/* FILTER BY LANGUAGE */}
      <div>
        <Form.Group>
          <Form.Label className="small">Language / Region</Form.Label>
          <Form.Check
            type="radio"
            label="lang1"
            id="lang1"
            name="languageFilter"
            defaultChecked={true}
          />
          <Form.Check
            type="radio"
            label="lang2"
            id="lang2"
            name="languageFilter"
            defaultChecked={false}
          />
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
