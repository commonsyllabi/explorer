import "node_modules/bootstrap/dist/css/bootstrap.min.css";
import SSRProvider from "react-bootstrap/SSRProvider";
import "pages/global_styles.scss";
import type { AppProps } from "next/app";
import { SessionProvider } from "next-auth/react";
import React, { useEffect } from "react";

const MATOMO_URL = process.env.NEXT_PUBLIC_MATOMO_URL as string;
const MATOMO_SITE_ID = process.env.NEXT_PUBLIC_MATOMO_SITE_ID as string;

function MyApp({ Component, pageProps: { session, ...pageProps } }: AppProps) {

  useEffect(() => {
    let _paq = window._paq = window._paq || [];
    _paq.push(["setDoNotTrack", true]);
    _paq.push(["disableCookies"]);
    _paq.push(['trackPageView']);
    _paq.push(['enableLinkTracking']);


    const u = "//analytics.enframed.net/";
    _paq.push(['setTrackerUrl', u + 'matomo.php']);
    _paq.push(['setSiteId', '1']);
    var d = document,
      g = d.createElement('script'),
      s = d.getElementsByTagName('script')[0];
    g.type = 'text/javascript';
    g.async = true;
    g.src = u + 'matomo.js';
    s.parentNode?.insertBefore(g, s);
}, [])

  return (
    <SessionProvider session={session}>
      <SSRProvider>
        <Component {...pageProps} />
      </SSRProvider>
    </SessionProvider>
  );
}

export default MyApp;
