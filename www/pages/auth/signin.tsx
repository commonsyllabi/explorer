import type { GetStaticProps, NextPage } from "next";
import Head from "next/head";
import GlobalNav from "components/GlobalNav";
import Link from "next/link";

import {
  Alert,
  Tabs,
  Tab,
  Row,
  Button,
  Col,
  Container,
  Form,
  FormControlProps,
} from "react-bootstrap";
import React, { useState } from "react";

import { useSession, signIn, signOut } from "next-auth/react";
import Router from "next/router";

export const getStaticProps: GetStaticProps = async () => {
  const states = ["Login", "Sign up"];
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  return {
    props: { apiUrl: apiUrl, states: states },
  };
};

interface IAuthProps {
  apiUrl: string;
  states: Array<string>;
}

const SignIn: NextPage<IAuthProps> = (props) => {
  const { data: session, status } = useSession();
  const url = new URL("users/", props.apiUrl);

  const [log, setLog] = useState("");
  const [error, setError] = useState("");
  const [isCreated, setCreated] = useState(false);

  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupEmailConf, setSignupEmailConf] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupPasswordConf, setSignupPasswordConf] = useState("");

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
      redirect: false,
    }).then((result) => {
      if (!result || result.error)
        setError(
          "There was an error logging you in. Please check your credentials"
        );
      else Router.push("/");
    });
  };

  const handleSignup = (e: React.BaseSyntheticEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (signupEmail !== signupEmailConf) {
      setLog("Emails should match!");
      return;
    }

    if (signupPassword !== signupPasswordConf) {
      setLog("Passwords should match!");
      return;
    }

    if (signupPassword.length < 8) {
      setLog("Password should be at least 8 characters");
      return;
    }

    if (signupName === "") {
      setLog("Name cannot be empty");
      return;
    }

    setLog("");

    const h = new Headers();
    h.append("Content-Type", "application/x-www-form-urlencoded");

    const b = new URLSearchParams();
    b.append("name", signupName);
    b.append("email", signupEmail);
    b.append("password", signupPassword);

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

  const handleSignupName = (e: React.BaseSyntheticEvent) => {
    const v = e.target.value as string;
    setSignupName(v);
  };

  const handleSignupEmail = (e: React.BaseSyntheticEvent) => {
    const v = e.target.value as string;
    setSignupEmail(v);
  };

  const handleSignupEmailConf = (e: React.BaseSyntheticEvent) => {
    const v = e.target.value as string;
    setSignupEmailConf(v);
  };

  const handleSignupPassword = (e: React.BaseSyntheticEvent) => {
    const v = e.target.value as string;
    setSignupPassword(v);
  };

  const handleSignupPasswordConf = (e: React.BaseSyntheticEvent) => {
    const v = e.target.value as string;
    setSignupPasswordConf(v);
  };

  //if already signed in, render usder info
  if (status === "authenticated") {
    return (
      <>
        <Head>
          <title>Sign In: Syllabi Explorer</title>
          <meta name="description" content="Sign in to Syllabi Explorer" />
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <Container fluid>
          <GlobalNav />
        </Container>
        <Container>
          <Row>
            <Col className="col-8 offset-2 py-5">
              <h1 className="h3 mb-3">
                You are logged in as{" "}
                <Link href={`/user/${session.user._id}`}>
                  {session.user.name}
                </Link>
                .
              </h1>
              <Button href="#" onClick={() => signOut({ callbackUrl: "/" })}>
                {" "}
                Sign Out
              </Button>
            </Col>
          </Row>
        </Container>
      </>
    );
  }

  //else render login form
  return (
    <>
      <Head>
        <title>Sign In: Syllabi Explorer</title>
        <meta name="description" content="Sign in to Syllabi Explorer" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Container fluid>
        <GlobalNav />
      </Container>
      <Container>
        <Row>
          <Col lg={{ span: 6, offset: 3 }} className="mt-5">
            {isCreated === false ? (
              <Container>
                <Tabs defaultActiveKey={props.states[0]} id="tab">
                  {/* LOGIN */}
                  <Tab eventKey="Login" title="Login">
                    <Form className="mt-2" onSubmit={handleLogin}>
                      <Form.Group className="mb-3" controlId="loginBasicEmail">
                        <Form.Label>Email address</Form.Label>
                        <Form.Control
                          required
                          name="username"
                          type="email"
                          placeholder="Enter email"
                          data-cy="Login-email"
                        />
                        <Form.Text className="text-muted">
                          We&#39;ll never share your email with anyone else.
                        </Form.Text>
                      </Form.Group>

                      <Form.Group
                        className="mb-3"
                        controlId="loginBasicPassword"
                      >
                        <Form.Label>Password</Form.Label>
                        <Form.Control
                          required
                          name="password"
                          type="password"
                          placeholder="Password"
                          data-cy="Login-password"
                        />
                      </Form.Group>

                      <Button
                        variant="primary"
                        type="submit"
                        data-cy="Login-submit"
                      >
                        Submit
                      </Button>
                    </Form>
                  </Tab>

                  {/* SIGN UP */}
                  <Tab eventKey="Sign up" title="Sign up" data-cy="Sign up">
                    <Form className="mt-2" onSubmit={handleSignup}>
                      <Form.Group className="mb-3" controlId="signupBasicName">
                        <Form.Label>Name</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Enter name"
                          data-cy="Signup-name"
                          onChange={handleSignupName}
                        />
                      </Form.Group>

                      <Form.Group className="mb-3" controlId="signupBasicEmail">
                        <Form.Label>Email address</Form.Label>
                        <Form.Control
                          type="email"
                          placeholder="Enter email"
                          data-cy="Signup-email"
                          onChange={handleSignupEmail}
                        />
                      </Form.Group>

                      <Form.Group
                        className="mb-3"
                        controlId="signupBasicEmailConfirm"
                      >
                        <Form.Label>Confirm email address</Form.Label>
                        <Form.Control
                          type="email"
                          placeholder="Confirm email"
                          data-cy="Signup-email-conf"
                          onChange={handleSignupEmailConf}
                        />
                        <Form.Text className="text-muted">
                          We&#39;ll never share your email with anyone else.
                        </Form.Text>
                      </Form.Group>

                      <Form.Group
                        className="mb-3"
                        controlId="signupBasicPassword"
                      >
                        <Form.Label>Password</Form.Label>
                        <Form.Control
                          type="password"
                          placeholder="Password"
                          data-cy="Signup-password"
                          onChange={handleSignupPassword}
                        />
                      </Form.Group>

                      <Form.Group
                        className="mb-3"
                        controlId="signupBasicPasswordConfirm"
                      >
                        <Form.Label>Confirm password</Form.Label>
                        <Form.Control
                          type="password"
                          placeholder="Confirm password"
                          data-cy="Signup-password-conf"
                          onChange={handleSignupPasswordConf}
                        />
                      </Form.Group>

                      <Button
                        variant="primary"
                        type="submit"
                        data-cy="Signup-submit"
                      >
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
                <h1 data-cy="Success" className="h2">
                  Your account was created!
                </h1>
                <p>Please check your email address to activate your account.</p>
              </>
            )}
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default SignIn;
