"use client";

/**
 * Modal â€” MUI Dialog-based modal component.
 * Focus trapping and Escape-to-close are handled natively by MUI Dialog.
 *
 * @param {ModalProps} props - Component props.
 * @returns {JSX.Element | null} A MUI Dialog, or null when closed.
 */

import React from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import { useTranslation } from "react-i18next";

interface ModalProps {
  /** Whether the modal is currently visible. */
  isOpen: boolean;
  /** Callback invoked when the user requests the modal to close. */
  onClose: () => void;
  /** Dialog title shown in the header. */
  title: string;
  /** Content rendered inside the modal body. */
  children: React.ReactNode;
  /** Optional footer content (e.g. action buttons). */
  footer?: React.ReactNode;
  /** Width size variant. Defaults to "md". */
  size?: "sm" | "md" | "lg" | "xl";
}

/** Maps custom size variant to MUI maxWidth. */
const SIZE_MAP = {
  sm: "xs",
  md: "sm",
  lg: "md",
  xl: "lg",
} as const;

/**
 * Modal dialog built on MUI Dialog.
 *
 * @param {ModalProps} props
 * @returns {JSX.Element | null}
 */
function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = "md",
}: ModalProps): JSX.Element | null {
  const { t } = useTranslation("common");

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth={SIZE_MAP[size]}
      fullWidth
      aria-labelledby="modal-dialog-title"
    >
      <DialogTitle id="modal-dialog-title" sx={{ pr: 6 }}>
        {title}
        <IconButton
          aria-label={t("modal.close")}
          onClick={onClose}
          size="small"
          sx={{ position: "absolute", right: 8, top: 8 }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>{children}</DialogContent>

      {footer && <DialogActions>{footer}</DialogActions>}
    </Dialog>
  );
}

export default Modal;
