import RootLayout from "app/layout";
import '../styles/globals.css';
import SSRProvider from "react-bootstrap/SSRProvider";
import type { AppProps } from "next/app";
import { SessionProvider } from "next-auth/react";
import React from "react";

function MyApp({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
    <SessionProvider session={session}>
      <SSRProvider>
        <RootLayout>
          <Component {...pageProps} />
        </RootLayout>
      </SSRProvider>
    </SessionProvider>
  );
}

export default MyApp;
