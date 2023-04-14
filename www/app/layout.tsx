import GlobalNav from "components/commons/GlobalNav";

import localFont from '@next/font/local'

export const inter = localFont({
  src: '../public/fonts/Inter-Regular.woff',
  variable: '--font-inter',
})

export const kurintoBook = localFont({
  src: '../public/fonts/KurintoBook-Regular.ttf',
  variable: '--font-kurinto-book',
})

export const kurintoSerif = localFont({
  src: '../public/fonts/KurintoSerif-Regular.ttf',
  variable: '--font-kurinto-serif',
})


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.className} ${kurintoBook.className}`}>
      <head>
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
      </head>
      <body className={`bg-slate-50 text-slate-800 dark:bg-slate-900 dark:text-slate-100 ${inter.className}`}>
        <div id="header-section" className="sticky">
          <GlobalNav />
        </div>
        <div className="container md:w-10/12 m-auto">
          {children}
        </div>
      </body>
    </html>
  );
}