import type { GetServerSideProps } from "next";

/**
 * Dashboard route entry point.
 *
 * Reuses the existing view-page implementation so /dashboard is handled
 * explicitly without introducing redirect loops.
 *
 * Provides `initialView` directly so the shared component receives its
 * required prop without relying on dynamic route params.
 *
 * @returns {GetServerSideProps} Server-side props with initialView preset to "dashboard".
 */
export { default } from "../[view]";

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    props: {
      initialView: "dashboard",
    },
  };
};
