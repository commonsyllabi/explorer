import type { NextPage } from "next";
import Image from "next/image";
import Link from "next/link";

const About: NextPage = () => {
  return (
    <div className="w-11/12 md:w-10/12 m-auto mt-8">
      <h1 className="text-xl pt-3 mt-5 mb-5">
        Cosyll is a platform for educators to publish and
        browse syllabi.
      </h1>
      <p>
        This project aims at providing infrastructure for open-access of syllabi and curricula; it is a place where we can meaningfully search, archive, distribute and reference syllabi.
      </p>
      <p>
        Cosyll is first and foremost for educators, by educators. Whether to have a convenient place to publish your classes, to see how a similar class is being taught at another university, in another country, or to find inspiration in your peers&apos; works, Cosyll focuses on exchange between teachers. In this spirit, we encourage the sharing of documents one does not always easily find online: schedules, assignments descriptions, works cited and referenced, class wikis, etc.
      </p>
      <p>
        <h2 className="text-lg my-3">Want to participate?</h2>
      </p>
      <p>
        To get started, you can get a feeling for Cosyll&apos;s collection by browsing the <Link className="underline" href="/">home page</Link>. If you decide to contribute yourself, start by <Link className="underline" href="/auth/signin">creating an account</Link>, and then <Link className="underline" href="/new-syllabus">add your first syllabus</Link>.
      </p>
      <p>
        If you are interested in the project and want to contribute to its development, if you have specific questions about how syllabi are handled, or if you just want to say hello, you can email us at <a className="underline" href="mailto:team@common-syllabi.org">team@common-syllabi.org</a>.
      </p>
      <p>
        If you just want to keep track of the newest developments of the project, you can <a
        className="underline"
          href="https://tinyletter.com/common-syllabi"
          target="_blank"
          rel="noopener noreferrer"
        >
          subscribe to our newsletter
        </a>.
      </p>
      <p>
        <h2 className="text-lg my-3">Who are we?</h2>
      </p>
      <p>
        We are a group of educators, designers and developers who firmly believe that open-access and information archival is essential to improve pedagogical practices. We are open to collaborations and cooperations, do not hesitate to <a href="mailto:team@common-syllabi.org">get in touch</a>!</p>

      <div className="flex flex-col mb-5 mt-5">
        <h2 className="text-lg my-3">Support</h2>
        <div className="flex flex-row items-center">
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
    </div>

  );
};

export default About;
