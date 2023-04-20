import { inter } from 'app/layout'
import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
    return (
        <Html lang="en">
            <Head />
            <body className={`h-full bg-slate-50 text-slate-800 dark:bg-slate-900 dark:text-slate-100 ${inter.className}`}>
                <Main />
                <NextScript />
            </body>
        </Html>
    )
}
