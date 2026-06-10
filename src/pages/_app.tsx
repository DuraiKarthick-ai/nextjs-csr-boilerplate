/**
 * _app.tsx — Next.js custom App component.
 * Initialises i18n, wraps every page with MainLayout, and
 * injects global CSS.
 *
 * On mount, triggers the server-side OAuth token warmup via useOAuthInit
 * so the Bearer token is cached before any ECS batch API calls are made.
 *
 * @param {AppProps} props - Next.js AppProps.
 * @returns {JSX.Element} The application root.
 */

import type { AppProps } from "next/app";
import type { NextComponentType, NextPageContext } from "next";
import React from "react";
import "../lib/i18n";
import "../styles/globals.scss";
import MainLayout from "../layouts/MainLayout";
import useOAuthInit from "../hooks/useOAuthInit";

/** Pages that set noLayout = true are rendered without the MainLayout shell. */
type PageWithLayout = NextComponentType<NextPageContext, unknown, object> & {
  noLayout?: boolean;
};

/**
 * Root application component applied to every page.
 * Fires the OAuth token warmup on initial mount via useOAuthInit.
 *
 * @param {AppProps} props
 * @returns {JSX.Element}
 */
function App({ Component, pageProps }: AppProps): JSX.Element {
  useOAuthInit();

  const page = <Component {...pageProps} />;

  if ((Component as PageWithLayout).noLayout) {
    return page;
  }

  return <MainLayout>{page}</MainLayout>;
}

export default App;
