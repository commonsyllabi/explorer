import * as React from "react";
import Head from "next/head";
import Favicons from "./head/favicons";
import Link from "next/link"
import { Container, Col, Row } from "react-bootstrap";
import GlobalNav from "./GlobalNav";

const NotFound: React.FunctionComponent = (props) => {
    return (
        <>
            <Head>
                <Favicons />
            </Head>

            <Container
                fluid
                id="header-section"
                className="container-fluid sticky-top"
            >
                <GlobalNav />
            </Container>
            <Container>
                <Row className="flex justify-content-center">
                    <Col className="pt-3 pb-5 flex flex-col gap-3" lg={10}>
                        <h1>Sorry!</h1>
                        <p>We couldn&apos;t find what you were looking for.</p>
                        <p>
                            Go back to the <Link href="/">the explorer</Link>.
                        </p>
                    </Col>
                </Row>
            </Container>
        </>
    );
};

export default NotFound;