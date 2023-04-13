import * as React from "react";
import Head from "next/head";
import Favicons from "./head/favicons";
import Link from "next/link"
import { Container, Col, Row } from "react-bootstrap";
import GlobalNav from "./GlobalNav";

const NotFound: React.FunctionComponent = (props) => {
    return (
        <div className="flex justify-center mt-8">
            <div className="pt-3 pb-5 flex flex-col gap-3">
                <h1 className="text-2xl font-bold">Sorry!</h1>
                <p>We couldn&apos;t find what you were looking for.</p>
                <p>
                    Go back to the <Link href="/" className="underline">main page</Link>.
                </p>
            </div>
        </div>
    );
};

export default NotFound;