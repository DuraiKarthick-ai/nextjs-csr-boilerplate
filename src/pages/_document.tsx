import Document, { Html, Head, Main, NextScript, DocumentContext } from "next/document";

/**
 * Custom _document — injects Roboto font via Google Fonts CDN
 * so the app matches the Figma design without requiring local font files.
 */
class MyDocument extends Document {
  static async getInitialProps(ctx: DocumentContext) {
    return Document.getInitialProps(ctx);
  }

  render() {
    return (
      <Html lang="en">
        <Head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
