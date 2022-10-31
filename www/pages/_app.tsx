// import "node_modules/bootstrap/dist/css/bootstrap.min.css";
import SSRProvider from "react-bootstrap/SSRProvider";
import "pages/global_styles.scss";
import type { AppProps } from "next/app";
import { SessionProvider } from "next-auth/react";
import React, { useEffect } from "react";
import Script from "next/script";

const MATOMO_URL = process.env.NEXT_PUBLIC_MATOMO_URL as string;
const MATOMO_SITE_ID = process.env.NEXT_PUBLIC_MATOMO_SITE_ID as string;

function MyApp({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
    <SessionProvider session={session}>
      <SSRProvider>
        {/* Analytics */}
        <Script
          defer
          data-domain="explorer.common-syllabi.org"
          src="https://stats.ia-fictions.net/js/plausible.js"
        ></Script>
        <Component {...pageProps} />
      </SSRProvider>
    </SessionProvider>
  );
}

export default MyApp;
