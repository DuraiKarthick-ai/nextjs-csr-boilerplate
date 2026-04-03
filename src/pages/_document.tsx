import { Html, Head, Main, NextScript } from "next/document";

/**
 * OWASP A05 Fix: Added lang attribute and charset meta — already present,
 * confirmed correct. No inline scripts here (CSP compliance).
 *
 * Note: Security headers (CSP, HSTS, etc.) are set in next.config.js headers()
 * not here — HTTP headers cannot be set via _document.tsx.
 */
export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta charSet="utf-8" />
        {/*
         * Preload critical fonts from public/fonts (moved from src/fonts).
         * Structure fix: font-display: swap is set in globals.scss @font-face.
         */}
        <link
          rel="preload"
          href="/fonts/Roboto-Regular.ttf"
          as="font"
          type="font/truetype"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/Roboto-Medium.ttf"
          as="font"
          type="font/truetype"
          crossOrigin="anonymous"
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
