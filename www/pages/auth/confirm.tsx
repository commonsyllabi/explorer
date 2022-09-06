import type { GetServerSideProps, NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";

import { GlobalNav } from "components/GlobalNav";

import { Row, Col, Container, Form } from "react-bootstrap";
import { useState, useEffect } from "react";



export const getServerSideProps: GetServerSideProps = async (context) => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const token = context.query.token as string
    const url = new URL(`auth/confirm?token=${token}`, apiUrl)
    let log = ''

    if (token != undefined) {
        log = `That's at least a valid token; we're checking it...`

        const h = new Headers()
        h.append("Content-Type", "application/x-www-form-urlencoded")

        const b = new URLSearchParams()
        b.append("token", token)

        const res  = await fetch(url)
        if(res.status === 200){
            log = `Your account is confirmed! You can now log in.`
        }else{
            const body =  await res.json()
            log = `There was a problem verifying your account (${body.message})`
        }
    } else {
        log = `Oops! Looks like the token you're using to confirm this account is invalid.`
    }

    return {
        props: {
            token: token,
            log: log
        }
    }
}

interface IConfirmProps {
    token: string,
    log: string
}

const Confirm: NextPage<IConfirmProps> = (props) => {

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
                    <h2>Confirm your account</h2>
                    <p>
                        {props.log}
                    </p>
                </Col>
            </Row>
        </Container>
    )
}

export default Confirm