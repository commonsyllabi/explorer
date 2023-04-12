import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";

import Container from "react-bootstrap/Container";

import Favicons from "components/head/favicons";
import GlobalNav from "components/GlobalNav";
import Link from "next/link";

const About: NextPage = () => {
  return (
    <>
      <Head>
        <title>About Cosyll</title>
        <meta
          name="description"
          content="About: Cosyll is an open platform for browsing and sharing syllabi."
        />
        <Favicons />
      </Head>
      <GlobalNav></GlobalNav>
      <Container>
          <h2 className="pt-3 mt-5 mb-5">
            Cosyll is a platform for educators to publish and
            browse syllabi.
          </h2>
          <p>
            This project aims at providing infrastructure for open-access of syllabi and curricula; it is a place where we can meaningfully search, archive, distribute and reference syllabi.
          </p>
          <p>
            Cosyll is first and foremost for educators, by educators. Whether to have a convenient place to publish your classes, to see how a similar class is being taught at another university, in another country, or to find inspiration in your peers&apos; works, Cosyll focuses on exchange between teachers. In this spirit, we encourage the sharing of documents one does not always easily find online: schedules, assignments descriptions, works cited and referenced, class wikis, etc.
          </p>
          <p>
            <b>Want to get involved?</b>
          </p>
          <p>
            To get started, you can get a feeling for Cosyll&apos;s collection by browsing the <Link href="/">home page</Link>. If you decide to contribute yourself, start by <Link href="/auth/signin">creating an account</Link>, and then <Link href="/NewSyllabus">add your first syllabus</Link>.
          </p>
          <p>
            If you are interested in the project and want to contribute to its development, if you have specific questions about how syllabi are handled, or if you just want to say hello, you can email us at <a href="mailto:team@common-syllabi.org">team@common-syllabi.org</a>.
          </p>
          <p>
            If you just want to keep track of the newest developments of the project, you can <a
              href="https://tinyletter.com/common-syllabi"
              target="_blank"
              rel="noopener noreferrer"
            >
              subscribe to our newsletter
            </a>.
          </p>
          <p>
            <b>Who are we?</b>
          </p>
          <p>
            We are a group of educators, designers and developers who firmly believe that open-access and information archival is essential to improve pedagogical practices. <a href="http://pierredepaz.net" target="_blank" rel="noopener noreferrer">Pierre Depaz</a> is the project lead; he teaches in various universities across France, Germany and the U.S. <a href="http://patshiu.com" target="_blank" rel="noopener noreferrer">Pat Shiu</a> is the lead designer and frontend developer, with an extensive background in web archival. <a href="http://github.com/grobie" target="_blank" rel="noopener noreferrer">Tobias Schmidt</a> is a software engineer with a decade of experience in building and maintaining robust infrastructures.
          </p>
          <p>We are open to collaborations and cooperations, do not hesitate to <a href="mailto:team@common-syllabi.org">get in touch</a>!</p>

          <div className="flex flex-col justify-content-center mb-5 mt-5">
            <h4 className="mb-3">Support</h4>
            <div className="flex flex-col flex-sm-row">
              <a
                href="http://prototypefund.de"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Image
                  className="m-4"
                  src="/ptfund_logo.svg"
                  alt="Prototype Fund"
                  width={300}
                  height={300}
                />
              </a>
              <a
                href="http://bmbf.de"
                target="_blank"
                rel="noopener noreferrer"
              >
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
      </Container>
    </>
  );
};

export default About;
