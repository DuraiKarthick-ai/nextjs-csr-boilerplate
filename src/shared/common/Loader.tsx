"use client";

/**
 * Loader — MUI CircularProgress spinner to indicate async operations.
 *
 * @param {LoaderProps} props - Component props.
 * @returns {JSX.Element} A centred MUI loading spinner.
 */

import React from "react";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import { useTranslation } from "react-i18next";

interface LoaderProps {
  /** Optional accessible label override for screen readers. */
  label?: string;
  /** Size variant of the spinner. Defaults to "md". */
  size?: "sm" | "md" | "lg";
}

/** Maps custom size to MUI CircularProgress pixel size. */
const SIZE_PX: Record<NonNullable<LoaderProps["size"]>, number> = {
  sm: 20,
  md: 36,
  lg: 52,
};

/**
 * Centred loading spinner built on MUI CircularProgress.
 *
 * @param {LoaderProps} props
 * @returns {JSX.Element}
 */
function Loader({ label, size = "md" }: LoaderProps): JSX.Element {
  const { t } = useTranslation("common");
  const ariaLabel = label ?? t("loading");

  return (
    <Box
      role="status"
      aria-label={ariaLabel}
      display="flex"
      alignItems="center"
      justifyContent="center"
      py={2}
    >
      <CircularProgress size={SIZE_PX[size]} aria-hidden="true" />
      <span style={{ position: "absolute", left: "-9999px" }}>{ariaLabel}</span>
    </Box>
  );
}

export default Loader;
