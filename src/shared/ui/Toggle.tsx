"use client";

/**
 * Toggle â€” MUI Switch-based on/off toggle component.
 *
 * @param {ToggleProps} props - Component props.
 * @returns {JSX.Element} A MUI FormControlLabel wrapping a Switch.
 */

import React from "react";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import FormHelperText from "@mui/material/FormHelperText";
import FormControl from "@mui/material/FormControl";

interface ToggleProps {
  /** Whether the toggle is currently checked/on. */
  checked: boolean;
  /** Callback fired when the toggle state changes. */
  onChange: (checked: boolean) => void;
  /** Visible label for the toggle. */
  label: string;
  /** Additional description for screen readers. */
  description?: string;
  /** When true, the toggle cannot be interacted with. */
  disabled?: boolean;
}

/**
 * Toggle switch built on MUI Switch.
 *
 * @param {ToggleProps} props
 * @returns {JSX.Element}
 */
function Toggle({
  checked,
  onChange,
  label,
  description,
  disabled = false,
}: ToggleProps): JSX.Element {
  return (
    <FormControl component="fieldset" disabled={disabled}>
      <FormControlLabel
        control={
          <Switch
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
            disabled={disabled}
          />
        }
        label={label}
      />
      {description && <FormHelperText>{description}</FormHelperText>}
    </FormControl>
  );
}

export default Toggle;
