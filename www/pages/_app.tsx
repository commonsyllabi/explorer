import "node_modules/bootstrap/dist/css/bootstrap.min.css";
import SSRProvider from "react-bootstrap/SSRProvider";
import "pages/global_styles.scss";
import type { AppProps } from "next/app";
import { SessionProvider } from "next-auth/react";

function MyApp({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
    <SessionProvider session={session}>
      <SSRProvider>
        <Component {...pageProps} />
      </SSRProvider>
    </SessionProvider>
  );
}

export default MyApp;
