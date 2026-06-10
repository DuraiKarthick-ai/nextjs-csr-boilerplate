"use client";

/**
 * Select â€” MUI-based dropdown select component with label and error states.
 *
 * @param {SelectProps} props - Component props.
 * @returns {JSX.Element} A labelled MUI Select within a FormControl.
 */

import React from "react";
import FormControl from "@mui/material/FormControl";
import FormHelperText from "@mui/material/FormHelperText";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import MuiSelect from "@mui/material/Select";
import type { SelectChangeEvent } from "@mui/material/Select";
import type { SelectOption } from "../../types/common.types";

interface SelectProps {
  /** Visible label for the select. */
  label?: string;
  /** Available options. */
  options: SelectOption[];
  /** Placeholder option shown when no value is selected. */
  placeholder?: string;
  /** Error message to display below the select. */
  error?: string;
  /** Currently selected value. */
  value?: string;
  /** Callback when the selected value changes. */
  onChange?: (event: SelectChangeEvent<string>) => void;
  /** When true, the select is disabled. */
  disabled?: boolean;
  /** Optional CSS class applied to the wrapper. */
  className?: string;
}

/**
 * Select component built on MUI Select.
 *
 * @param {SelectProps} props
 * @returns {JSX.Element}
 */
function Select({
  label,
  options,
  placeholder,
  error,
  value = "",
  onChange,
  disabled = false,
  className = "",
}: SelectProps): JSX.Element {
  const labelId = label ? `select-label-${label.replace(/\s+/g, "-").toLowerCase()}` : undefined;

  return (
    <FormControl
      size="small"
      fullWidth
      error={Boolean(error)}
      disabled={disabled}
      className={className}
    >
      {label && <InputLabel id={labelId}>{label}</InputLabel>}
      <MuiSelect
        labelId={labelId}
        label={label}
        value={value}
        onChange={onChange}
        displayEmpty={Boolean(placeholder)}
      >
        {placeholder && (
          <MenuItem value="" disabled>
            {placeholder}
          </MenuItem>
        )}
        {options.map((opt) => (
          <MenuItem key={opt.value} value={opt.value}>
            {opt.label}
          </MenuItem>
        ))}
      </MuiSelect>
      {error && <FormHelperText>{error}</FormHelperText>}
    </FormControl>
  );
}

export default Select;
