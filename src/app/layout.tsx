import type { Metadata } from "next";
import { Epilogue } from "next/font/google";
import Script from "next/script";
import SessionProvider from "@/components/SessionProvider";
import AdProvider from "@/components/AdProvider";
import "./globals.css";

const epilogue = Epilogue({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "WSFA",
  description: "Discover, brew, and share premium coffee & tea recipes",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" translate="no" suppressHydrationWarning>
      <head>
        <meta name="google" content="notranslate" />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
        {/* Apply dark mode before first paint to prevent flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{if(localStorage.getItem('brewcraft-dark')==='true'){document.documentElement.classList.add('dark')}}catch(e){}})()`,
          }}
        />
      </head>
      <body className={`${epilogue.variable} font-display antialiased`}>
        {process.env.NEXT_PUBLIC_ADSENSE_ID && (
          <Script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_ID}`}
            crossOrigin="anonymous"
            strategy="lazyOnload"
          />
        )}
        <SessionProvider>
          <AdProvider>{children}</AdProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
