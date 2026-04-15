import { Dialog } from "@mui/material";
import styles from "./printSuccessDialog.module.scss";

interface PrintSuccessDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
}

/**
 * Reusable success dialog for print actions.
 *
 * @param {PrintSuccessDialogProps} props - Dialog state and display text.
 * @returns {JSX.Element} The print success confirmation dialog.
 */
export default function PrintSuccessDialog({
  open,
  onClose,
  title,
  message,
  confirmLabel = "OK",
}: PrintSuccessDialogProps): JSX.Element {
  const dialogCloseIcon = (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <g clipPath="url(#clip0_54627_16206)">
        <path
          d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z"
          fill="#64686C"
        />
      </g>
      <defs>
        <clipPath id="clip0_54627_16206">
          <rect width="24" height="24" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <div className={styles.successDialog}>
        <button
          type="button"
          className={styles.dialogClose}
          onClick={onClose}
          aria-label="Close success dialog"
        >
          <i>{dialogCloseIcon}</i>
        </button>
        <h1>{title}</h1>
        <p>{message}</p>
        <button type="button" className="primaryButton" onClick={onClose}>
          {confirmLabel}
        </button>
      </div>
    </Dialog>
  );
}
