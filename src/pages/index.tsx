"use client";
import { useEffect } from "react";
import { useRouter } from "next/router";

/**
 * Root index page — redirects to the default /dashboard view.
 *
 * The actual app shell lives in [view].tsx which reads the active view
 * from the URL so the browser address bar always reflects the current screen.
 *
 * @returns {null} Renders nothing while the redirect is in progress.
 */
export default function IndexRedirect(): null {
  const router = useRouter();

  useEffect(() => {
    void router.replace("/dashboard");
  }, [router]);

  return null;
}
