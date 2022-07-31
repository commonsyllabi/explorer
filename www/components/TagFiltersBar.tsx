import * as React from "react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";

const TagsFiltersBar: React.FunctionComponent = () => {
  return (
    <>
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
    </>
  );
};

export default TagsFiltersBar;
