"use client";

/**
 * EmptyState — MUI-based placeholder rendered when a list has no items.
 *
 * @param {EmptyStateProps} props - Component props.
 * @returns {JSX.Element} A centred empty-state message.
 */

import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import InboxIcon from "@mui/icons-material/Inbox";
import { useTranslation } from "react-i18next";

interface EmptyStateProps {
  /** Primary heading shown in the empty state. */
  title?: string;
  /** Supporting description text below the heading. */
  description?: string;
  /** Optional call-to-action element. */
  action?: React.ReactNode;
}

/**
 * Empty state placeholder built on MUI components.
 *
 * @param {EmptyStateProps} props
 * @returns {JSX.Element}
 */
function EmptyState({ title, description, action }: EmptyStateProps): JSX.Element {
  const { t } = useTranslation("common");

  return (
    <Box
      role="status"
      aria-live="polite"
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      gap={1.5}
      py={8}
      textAlign="center"
    >
      <InboxIcon sx={{ fontSize: 48, color: "text.disabled" }} aria-hidden="true" />
      <Typography variant="subtitle1" color="text.secondary" fontWeight={600}>
        {title ?? t("emptyState.title")}
      </Typography>
      {description && (
        <Typography variant="body2" color="text.secondary" maxWidth={320}>
          {description}
        </Typography>
      )}
      {action && <Box mt={1}>{action}</Box>}
    </Box>
  );
}

export default EmptyState;
