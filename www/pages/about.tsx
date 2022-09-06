import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import { GlobalNav } from "components/GlobalNav";

const About: NextPage = () => {
  return (
    <div className="container">
      <GlobalNav />
      <Head>
        <title>About Syllabi Explorer</title>
        <meta name="description" content="About Syllabi Explorer" />
        <link rel="icon" href="/favicon.ico" />
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
        <p>
          <a
            href="https://commonsyllabi.org/#contributors"
            target="_blank"
            rel="noreferrer"
          >
            Contributors
          </a>
          &nbsp;&nbsp;|&nbsp;&nbsp;
          <a href="mailto:team@common-syllabi.org">Contact</a>
          &nbsp;&nbsp;|&nbsp;&nbsp;
          <a href="https://tinyletter.com/common-syllabi" target="_blank" rel="noopener noreferrer">Subscribe to the newsletter</a>
        </p>
      </div>
    </div>
  );
};

export default About;
