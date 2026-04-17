import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import { CheckCircleIcon } from "./icons";
import { TOAST_AUTO_HIDE_MS } from "@/constants/print";

interface SuccessToastProps {
  /** Whether the toast is visible. */
  open: boolean;
  /** Callback when the toast should close. */
  onClose: () => void;
  /** The message to display inside the toast. */
  message: string;
}

/**
 * Reusable success toast notification positioned at the top-right
 * of the nearest positioned ancestor (ContentWrapper).
 *
 * @param {SuccessToastProps} props - Toast visibility, close handler, and message.
 * @returns {JSX.Element} A green success Snackbar/Alert toast.
 */
export default function SuccessToast({ open, onClose, message }: SuccessToastProps): JSX.Element {
  return (
    <Snackbar
      open={open}
      autoHideDuration={TOAST_AUTO_HIDE_MS}
      onClose={onClose}
      anchorOrigin={{ vertical: "top", horizontal: "right" }}
      sx={{ position: "absolute", top: "10px", right: "10px" }}
    >
      <Alert
        onClose={onClose}
        severity="success"
        variant="standard"
        icon={<CheckCircleIcon />}
        sx={{
          backgroundColor: "#edf7ed",
          color: "#1e4620",
          border: "1px solid #c6e6c6",
          borderRadius: "4px",
          fontSize: "14px",
          maxWidth: "320px",
          "& .MuiAlert-message": { whiteSpace: "normal", wordBreak: "break-word" },
        }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
}
