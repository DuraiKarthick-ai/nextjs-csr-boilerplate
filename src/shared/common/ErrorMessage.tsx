"use client";

import styles from './Error.module.scss'

/**
 * ErrorMessage — MUI Alert-based inline error component.
 *
 * Security: never renders raw error objects or stack traces; only
 * the sanitised message string is displayed.
 *
 * @param {ErrorMessageProps} props - Component props.
 * @returns {JSX.Element | null} A MUI Alert, or null if no message.
 */

import React from "react";
import { useTranslation } from "react-i18next";

interface ErrorMessageProps {
  /** The error message string to display. */
  message?: string | null;
  /** Optional custom heading. Defaults to "Error". */
  title?: string;
}

/**
 * Inline error alert built on MUI Alert.
 *
 * @param {ErrorMessageProps} props
 * @returns {JSX.Element | null}
 */
function ErrorMessage({ message, title }: ErrorMessageProps): JSX.Element | null {
  const { t } = useTranslation("common");

  if (!message) return null;

  return (
    <div className={styles.errorBox} role="alert">
      <h4>{title ?? t("error.title")}</h4>
      <p>{message}</p>
    </div>
  );
}

export default ErrorMessage;
