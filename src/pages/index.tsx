"use client";
import { useState } from "react";

import React from "react";
import dynamic from "next/dynamic";

import Header from "../components/Header/Header";
import Layout from "../components/Layout/layout";

import styles from "./index.module.scss";

const AuthGate = dynamic(() => import("@/components/auth/AuthGate"), {
  ssr: false,
});

// const SignsLayout = dynamic(
//   () => import("@/components/layout/SignsLayout"),
//   { ssr: false }
// );

/**
 * Landing page for the Signs app.
 *
 * In production this app is consumed as a remote via Module Federation
 * (the Portal loads `./ProductsPage`). When accessed directly (standalone
 * or GKE external URL) the AuthGate blocks access and shows a
 * "Go to Portal" screen.
 *
 * Both components are loaded with `ssr: false` because they depend on
 * Module Federation's shared React singleton — not available during SSR.
 */
export default function SignsIndex() {

  const [open, setOpen] = useState(true);

  return (
    <>
        <Header open={open} toggle={() => setOpen(!open)} />

        <Layout open={open} />
    </>
  );
}
