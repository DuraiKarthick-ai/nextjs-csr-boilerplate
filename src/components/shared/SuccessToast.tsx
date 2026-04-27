import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import { ThemeProvider } from "@mui/material/styles";
import CheckIcon from '@mui/icons-material/Check';
import { TOAST_AUTO_HIDE_MS } from "@/constants/print";
import theme from "@/theme/customizeTheme";

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
    <ThemeProvider theme={theme}>
      <Snackbar
        open={open}
        autoHideDuration={TOAST_AUTO_HIDE_MS}
        onClose={onClose}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={onClose}
          severity="success"
          variant="standard"
          icon={<CheckIcon fontSize="inherit" />}
        >
          {message}
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
}
