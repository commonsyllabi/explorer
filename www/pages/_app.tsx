import RootLayout from "app/layout";
import '../styles/globals.css';
import SSRProvider from "react-bootstrap/SSRProvider";
import type { AppProps } from "next/app";
import { SessionProvider } from "next-auth/react";
import React from "react";
import Head from "next/head";

function MyApp({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
    <SessionProvider session={session}>
      <SSRProvider>
        <RootLayout>
          <Head>
            <meta
              name="description"
              content="Archive, share and browse syllabi."
            />
            <meta
              name="title"
              content="Cosyll"
            />
            <script defer
              data-domain="explorer.common-syllabi.org"
              src="https://stats.ia-fictions.net/js/plausible.js"></script>
            <title>Cosyll: share and archive syllabi</title>
          </Head>
          <Component {...pageProps} />
        </RootLayout>
      </SSRProvider>
    </SessionProvider>
  );
}

export default MyApp;
