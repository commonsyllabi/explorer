import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image"

import Favicons from "components/head/favicons";
import GlobalNav from "components/GlobalNav";

const About: NextPage = () => {
  return (
    <div className="container">
      <GlobalNav />
      <Head>
        <title>About Syllabi Explorer</title>
        <meta
          name="description"
          content="About: Syllabi Explorer is an open platform for browsing and sharing syllabi."
        />
        <Favicons />
      </Head>
      <div>
        <h1 className="pt-3">About Syllabi Explorer</h1>
        <p className="lead col-md-8">
          The SyllabiExplorer is a platform on which educators can publish and
          browse syllabi.
        </p>
        <p>
          This project aims to address the lack of openly browsable repositories
          of syllabi and curricula. Currently, the curricula designed by
          educators are too often locked away behind the walls of proprietary
          software and institutional accounts. Despite the fact that educators
          typically own the intellectual property rights to the course material
          they develop, there are few tools that specifically support the open
          sharing and discovery of learning materials between teachers.
        </p>
        <p>
          By and large, education is a field that thrives on open sharing and
          collaborative progress, and our goal with Syllabi Explorer is to
          create a platform that enables wide access to curricula.
        </p>
        <div className="py-2">
          <h2 className="mb-3">Contributors</h2>
          <ul className="d-flex flex-lg-column">
            <li className="mb-2">
              <a href="http://pierredepaz.net" target="_blank" rel="noopener noreferrer">Pierre
                Depaz</a> (project lead)
            </li>
            <li className="mb-2">
              <a href="http://github.com/grobie" target="_blank" rel="noopener noreferrer">Tobias Schmidt</a> (programming)
            </li>

            <li className="mb-2"><a href="http://patshiu.com" target="_blank"
              rel="noopener noreferrer">Pat
              Shiu</a> (programming, design)
            </li>
          </ul>
        </div>

        <div className="py-2">
          <h2 className="mb-3">Contact</h2>
          <ul className="d-flex flex-lg-column">
            <li className="mb-2">Do you want to contribute to the project, but are not sure where to start? <a href="mailto:team@common-syllabi.org">Email us!</a></li>
            <li className="mb-2">If you want to keep track of the development of the project, <a
              href="https://tinyletter.com/common-syllabi"
              target="_blank"
              rel="noopener noreferrer"
            >
              subscribe to the newsletter
            </a>.</li>
          </ul>
        </div>

        <div className="d-flex flex-column justify-content-center mb-5">
        <h2 className="mb-3">Support</h2>
          <div className="d-flex flex-column flex-sm-row">
            <a href="http://prototypefund.de" target="_blank" rel="noopener noreferrer">
              <Image
                className="m-4"
                src="/ptfund_logo.svg"
                alt="Prototype Fund"
                width={300}
                height={300}
              />
            </a>
            <a href="http://bmbf.de" target="_blank" rel="noopener noreferrer">
              <Image
                className="m-4"
                src="/bmbf_logo.svg"
                alt="Bundesministerium für Bildung und Forschung"
                width={300}
                height={300}
              />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
