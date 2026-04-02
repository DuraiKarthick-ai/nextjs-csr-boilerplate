import React from "react";
import type { AppProps } from "next/app";
import "../styles/globals.scss";

/**
 * Signs App entry point.
 *
 * When mounted inside the Portal (via Module Federation), the AuthProvider
 * is already wrapping this component from the host. When running standalone,
 * auth features are stubbed.
 */
export default function SignsApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
