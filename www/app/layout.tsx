import GlobalNav from "components/GlobalNav";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
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
      </head>
      <body className="bg-slate-50 text-slate-800 dark:bg-slate-900 dark:text-slate-100">
        <div id="header-section" className="sticky">
          <GlobalNav />
        </div>
        <div className="container md:w-10/12 m-auto font-sans">
          {children}
        </div>
      </body>
    </html>
  );
}