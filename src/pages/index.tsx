import Head from "next/head";

/**
 * Root page for load balancer checks.
 *
 * Returns a minimal static payload at / so probes receive a deterministic
 * HTTP 200 response without depending on routing or UI state.
 *
 * @returns {JSX.Element} A minimal response page.
 */
export default function IndexPage(): JSX.Element {
  return (
    <>
      <Head>
        <title>Signs</title>
      </Head>
      <main aria-label="root-status">ok</main>
    </>
  );
}
