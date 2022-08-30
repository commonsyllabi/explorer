import type { NextPage } from "next";
import Head from "next/head";
import { GlobalNav } from "components/GlobalNav";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";

import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

const SignIn: NextPage = () => {
  return (
    <Container>
      <Head>
        <title>Sign In: Syllabi Explorer</title>
        <meta name="description" content="Sign in to Syllabi Explorer" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <GlobalNav />
      <Row>
        <Col lg={{ span: 6, offset: 3 }}>
          <h1 className="pt-3">Login</h1>
          <Form>
            <Form.Group className="mb-3" controlId="formBasicEmail">
              <Form.Label>Email address</Form.Label>
              <Form.Control type="email" placeholder="Enter email" />
              <Form.Text className="text-muted">
                We&#39;ll never share your email with anyone else.
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3" controlId="formBasicPassword">
              <Form.Label>Password</Form.Label>
              <Form.Control type="password" placeholder="Password" />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formBasicCheckbox">
              <Form.Check type="checkbox" label="Check me out" />
            </Form.Group>
            <Button variant="primary" type="submit">
              Submit
            </Button>
          </Form>
        </Col>
      </Row>
    </Container>
  );
};

export default SignIn;
