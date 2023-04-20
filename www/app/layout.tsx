import GlobalNav from "components/commons/GlobalNav";

import localFont from '@next/font/local'
import Footer from "components/commons/Footer";

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
  return (<>
    <div className={`h-full bg-slate-50 text-slate-800 dark:bg-slate-900 dark:text-slate-100 ${inter.className}`}>
      <GlobalNav />
      <div className="h-full container md:w-10/12 m-auto mb-16">
        {children}
      </div>
      <Footer />
    </div>
  </>
  );
}