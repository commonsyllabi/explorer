import type { NextPage } from "next";
import Head from "next/head";
import { GlobalNav } from "components/GlobalNav";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";

import Container from "react-bootstrap/Container";
import Tabs from "react-bootstrap/Tabs";
import Tab from "react-bootstrap/Tab";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { FormEvent } from "react";

import { signIn, useSession } from "next-auth/react"

const states = ['Login', 'Sign up']

const SignIn: NextPage = () => {
  // const { data: session } = useSession();

  const handleLogin = (e : React.FormEvent<HTMLInputElement>) => {
    e.preventDefault()
    e.stopPropagation()
    
    const u = e.target.children[0].children.username.value
    const p = e.target.children[1].children.password.value
    console.warn("Sanitize the input!")
    signIn("credentials", {
      username: u,
      password: p,
      callbackUrl: '/'
    })
  }

  const handleSignup = (e : FormEvent) => {
    e.preventDefault()
    e.stopPropagation()
    console.log('signup',e.currentTarget)
  }

  return (
    <Container>
      <Head>
        <title>Sign In: Syllabi Explorer</title>
        <meta name="description" content="Sign in to Syllabi Explorer" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <GlobalNav />

      <Row>
        <Col lg={{ span: 6, offset: 3 }} className="mt-5">
          <Tabs defaultActiveKey={states[0]} fill="true">
            {/* LOGIN */}
            <Tab eventKey="Login" title="Login">
              <Form className="mt-2" onSubmit={handleLogin}>
                <Form.Group className="mb-3" controlId="formBasicEmail">
                  <Form.Label>Email address</Form.Label>
                  <Form.Control required name="username" type="email" placeholder="Enter email" />
                  <Form.Text className="text-muted">
                    We&#39;ll never share your email with anyone else.
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-3" controlId="formBasicPassword">
                  <Form.Label>Password</Form.Label>
                  <Form.Control required name="password" type="password" placeholder="Password" />
                </Form.Group>

                <Button variant="primary" type="submit">
                  Submit
                </Button>
              </Form>
            </Tab>

            {/* SIGN UP */}
            <Tab eventKey="Sign up" title="Sign up">
              <Form className="mt-2" onSubmit={handleSignup}>
                <Form.Group className="mb-3" controlId="formBasicName">
                  <Form.Label>Name</Form.Label>
                  <Form.Control type="text" placeholder="Enter name" />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formBasicEmail">
                  <Form.Label>Email address</Form.Label>
                  <Form.Control type="email" placeholder="Enter email" />
                  <Form.Control type="email-conf" placeholder="Confirm email" />
                  <Form.Text className="text-muted">
                    We&#39;ll never share your email with anyone else.
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-3" controlId="formBasicPassword">
                  <Form.Label>Password</Form.Label>
                  <Form.Control type="password" placeholder="Password" />
                  <Form.Label>Confirm password</Form.Label>
                  <Form.Control type="password" placeholder="Confirm password" />
                </Form.Group>
                <Button variant="primary" type="submit">
                  Sign up
                </Button>
              </Form>
            </Tab>
          </Tabs>
        </Col>
      </Row>
    </Container>
  );
};

export default SignIn;
