"use client";

/**
 * Button — MUI-based button component supporting multiple visual variants,
 * sizes, and a loading state.
 *
 * @param {ButtonProps} props - Component props.
 * @returns {JSX.Element} A styled MUI button element.
 */

import React from "react";
import MuiButton from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import type { ButtonProps as MuiButtonProps } from "@mui/material/Button";

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends Omit<MuiButtonProps, "variant" | "size" | "color"> {
  /** Visual style variant. Defaults to "primary". */
  variant?: ButtonVariant;
  /** Size of the button. Defaults to "md". */
  size?: ButtonSize;
  /** When true, shows a loading spinner and disables interaction. */
  isLoading?: boolean;
  /** Icon element rendered before the button label. */
  leftIcon?: React.ReactNode;
}

/** Maps custom variant to MUI color + variant props. */
function resolveMuiProps(variant: ButtonVariant): {
  muiVariant: MuiButtonProps["variant"];
  color: MuiButtonProps["color"];
} {
  switch (variant) {
    case "primary":
      return { muiVariant: "contained", color: "primary" };
    case "secondary":
      return { muiVariant: "outlined", color: "primary" };
    case "danger":
      return { muiVariant: "contained", color: "error" };
    case "ghost":
      return { muiVariant: "text", color: "primary" };
    default:
      return { muiVariant: "contained", color: "primary" };
  }
}

/** Maps custom size to MUI size. */
function resolveMuiSize(size: ButtonSize): MuiButtonProps["size"] {
  if (size === "sm") return "small";
  if (size === "lg") return "large";
  return "medium";
}

/**
 * Button component built on MUI Button.
 *
 * @param {ButtonProps} props
 * @returns {JSX.Element}
 */
function Button({
  variant = "primary",
  size = "md",
  isLoading = false,
  leftIcon,
  children,
  disabled,
  ...rest
}: ButtonProps): JSX.Element {
  const { muiVariant, color } = resolveMuiProps(variant);
  const muiSize = resolveMuiSize(size);
  const isDisabled = disabled || isLoading;

  return (
    <MuiButton
      variant={muiVariant}
      color={color}
      size={muiSize}
      disabled={isDisabled}
      aria-busy={isLoading}
      startIcon={isLoading ? <CircularProgress size={16} color="inherit" /> : leftIcon}
      {...rest}
    >
      {children}
    </MuiButton>
  );
}

export default Button;
