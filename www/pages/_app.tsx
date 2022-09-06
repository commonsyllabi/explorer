import "node_modules/bootstrap/dist/css/bootstrap.min.css";
import SSRProvider from "react-bootstrap/SSRProvider";
import "pages/global_styles.scss";
import type { AppProps } from "next/app";
import { SessionProvider } from "next-auth/react";
import React, { useEffect } from "react";
import { init } from "@socialgouv/matomo-next";

const MATOMO_URL = process.env.NEXT_PUBLIC_MATOMO_URL as string;
const MATOMO_SITE_ID = process.env.NEXT_PUBLIC_MATOMO_SITE_ID as string;

function MyApp({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  useEffect(() => {
    init({ url: MATOMO_URL, siteId: MATOMO_SITE_ID });
  }, []);

  return (
    <SessionProvider session={session}>
      <SSRProvider>
        <Component {...pageProps} />
      </SSRProvider>
    </SessionProvider>
  );
}

export default MyApp;
