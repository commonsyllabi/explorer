import type { GetServerSideProps, NextPage } from "next";
import Head from "next/head";

import GlobalNav from "components/GlobalNav";

import { Row, Col, Container } from "react-bootstrap";
import Favicons from "components/head/favicons";

export const getServerSideProps: GetServerSideProps = async (context) => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const token = context.query.token as string;
  const url = new URL(`auth/confirm?token=${token}`, apiUrl);
  let log = "";

  if (token != undefined) {
    log = `That's at least a valid token; we're checking it...`;

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token: token }),
    });

    if (res.status === 200) {
      log = `Your account is confirmed! You can now log in.`;
    } else {
      const body = await res.text();
      log = `There was a problem verifying your account (${body})`;
    }
  } else {
    log = `Oops! Looks like the token you're using to confirm this account is invalid.`;
  }

  return {
    props: {
      token: token,
      log: log,
    },
  };
};

interface IConfirmProps {
  token: string;
  log: string;
}

const Confirm: NextPage<IConfirmProps> = (props) => {
  return (
    <>
      <Head>
        <title>Sign In: Cosyll</title>
        <meta name="description" content="Sign in to Cosyll" />
        <Favicons />
      </Head>
      <Container fluid id="header-section" className="sticky-top">
        <GlobalNav />
      </Container>
      <Container>
        <Row>
          <Col lg={{ span: 6, offset: 3 }} className="mt-5">
            <h2>Confirm your account</h2>
            <p>{props.log}</p>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default Confirm;
