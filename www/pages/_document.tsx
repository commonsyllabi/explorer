import { inter } from 'app/layout'
import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
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
      <body className={`h-full bg-slate-50 text-slate-800 dark:bg-slate-900 dark:text-slate-100 ${inter.className}`}>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
