"use client";

/**
 * Input — MUI TextField-based input component with label, error, and helper text.
 *
 * Security: all values are controlled by React state; the component
 * applies no eval or innerHTML operations.
 *
 * @param {InputProps} props - Component props.
 * @returns {JSX.Element} A labelled MUI TextField.
 */

import React from "react";
import TextField from "@mui/material/TextField";
import type { TextFieldProps } from "@mui/material/TextField";

/** InputProps maps familiar HTML attributes onto MUI TextField. */
type InputProps = Omit<TextFieldProps, "variant"> & {
  /** Visible label associated with the input. */
  label?: string;
  /** Error message displayed below the input when set. */
  error?: string;
  /** Supplementary help text shown below the input. */
  helperText?: string;
};

/**
 * Input component built on MUI TextField.
 *
 * @param {InputProps} props
 * @returns {JSX.Element}
 */
function Input({ label, error, helperText, ...rest }: InputProps): JSX.Element {
  return (
    <TextField
      label={label}
      error={Boolean(error)}
      helperText={error ?? helperText}
      variant="outlined"
      size="small"
      fullWidth
      {...rest}
    />
  );
}

export default Input;
