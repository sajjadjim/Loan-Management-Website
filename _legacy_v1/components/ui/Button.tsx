import React, { ButtonHTMLAttributes } from "react";
import styles from "./Button.module.css";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "success" | "danger" | "outline";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  fullWidth = false,
  icon,
  className = "",
  disabled,
  ...props
}) => {
  const classNames = [
    styles.btn,
    styles[variant],
    size !== "md" ? styles[size] : "",
    fullWidth ? styles.fullWidth : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button className={classNames} disabled={disabled} {...props}>
      {icon && <span className={styles.icon}>{icon}</span>}
      {children}
    </button>
  );
};
