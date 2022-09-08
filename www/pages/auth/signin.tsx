import type { NextPage } from "next";
import Head from "next/head";
import { GlobalNav } from "components/GlobalNav";

import {
  Alert,
  Tabs,
  Tab,
  Row,
  Button,
  Col,
  Container,
  Form,
} from "react-bootstrap";
import { useState } from "react";

import { signIn } from "next-auth/react";

const states = ["Login", "Sign up"];
const apiUrl = process.env.NEXT_PUBLIC_API_URL;

const SignIn: NextPage = () => {
  const url = new URL("users/", apiUrl);

  const [log, setLog] = useState("");
  const [error, setError] = useState("");
  const [isCreated, setCreated] = useState(false);

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const t = e.target as HTMLInputElement;
    const u = t.children[0].children[1] as HTMLInputElement;
    const p = t.children[1].children[1] as HTMLInputElement;
    console.warn("Sanitize the input!");
    // TODO: catch signin error
    signIn("credentials", {
      username: u.value,
      password: p.value,
      callbackUrl: "/",
    });
  };

  const handleSignup = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const t = e.target as HTMLInputElement;
    const name = t.children[0].children[1] as HTMLInputElement;
    const email = t.children[1].children[1] as HTMLInputElement;
    const email_conf = t.children[1].children[3] as HTMLInputElement;

    const password = t.children[2].children[1] as HTMLInputElement;
    const password_conf = t.children[2].children[3] as HTMLInputElement;

    // console.log(`signing up with:\nname: ${name.value}\nemail: ${email.value} - ${email_conf.value}\npassword: ${password.value} - ${password_conf.value}`);

    if (email.value !== email_conf.value) {
      setLog("Emails should match!");
      return;
    }

    if (password.value !== password_conf.value) {
      setLog("Passwords should match!");
      return;
    }

    if (password.value.length < 8) {
      setLog("Password should be at least 8 characters");
      return;
    }

    if (name.value === "") {
      setLog("Name cannot be empty");
      return;
    }

    setLog("");

    const h = new Headers();
    h.append("Content-Type", "application/x-www-form-urlencoded");

    const b = new URLSearchParams();
    b.append("name", name.value);
    b.append("email", email.value);
    b.append("password", password.value);

    fetch(url.href, {
      method: "POST",
      headers: h,
      body: b,
    })
      .then((res) => {
        if (res.status == 201) setCreated(true);
        else return res.text();
      })
      .then((body) => {
        setError(body as string);
      })
      .catch((err) => {
        console.error(err);
      });
  };

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
          {isCreated === false ? (
            <Container>
              <Tabs defaultActiveKey={states[0]}>
                {/* LOGIN */}
                <Tab eventKey="Login" title="Login">
                  <Form className="mt-2" onSubmit={handleLogin}>
                    <Form.Group className="mb-3" controlId="formBasicEmail">
                      <Form.Label>Email address</Form.Label>
                      <Form.Control
                        required
                        name="username"
                        type="email"
                        placeholder="Enter email"
                      />
                      <Form.Text className="text-muted">
                        We&#39;ll never share your email with anyone else.
                      </Form.Text>
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="formBasicPassword">
                      <Form.Label>Password</Form.Label>
                      <Form.Control
                        required
                        name="password"
                        type="password"
                        placeholder="Password"
                      />
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
                      <Form.Label>Confirm email address</Form.Label>
                      <Form.Control
                        type="email-conf"
                        placeholder="Confirm email"
                      />
                      <Form.Text className="text-muted">
                        We&#39;ll never share your email with anyone else.
                      </Form.Text>
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="formBasicPassword">
                      <Form.Label>Password</Form.Label>
                      <Form.Control type="password" placeholder="Password" />
                      <Form.Label>Confirm password</Form.Label>
                      <Form.Control
                        type="password"
                        placeholder="Confirm password"
                      />
                    </Form.Group>
                    <Button variant="primary" type="submit">
                      Sign up
                    </Button>
                  </Form>
                </Tab>
              </Tabs>

              {log !== "" ? (
                <Alert variant="warning" className="mt-3">
                  {log}
                </Alert>
              ) : (
                <></>
              )}

              {error !== "" ? (
                <Alert variant="danger" className="mt-3">
                  {error}
                </Alert>
              ) : (
                <></>
              )}
            </Container>
          ) : (
            <>
              <h1>Your account was created!</h1>
              <p>Please check your email address to activate your account.</p>
            </>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default SignIn;
