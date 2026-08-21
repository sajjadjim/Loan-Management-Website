import React, { InputHTMLAttributes, forwardRef } from "react";
import styles from "./Input.module.css";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  prefixIcon?: React.ReactNode;
  required?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, prefixIcon, required, className = "", ...props }, ref) => {
    return (
      <div className={`${styles.container} ${error ? styles.hasError : ""} ${className}`}>
        {label && (
          <label className={styles.label}>
            {label}
            {required && <span className={styles.required}>*</span>}
          </label>
        )}
        <div className={`${styles.inputWrapper} ${prefixIcon ? styles.hasPrefix : ""}`}>
          {prefixIcon && <span className={styles.prefixIcon}>{prefixIcon}</span>}
          <input ref={ref} className={styles.input} {...props} />
        </div>
        {error && <span className={styles.errorMsg}>{error}</span>}
        {!error && helperText && <span className={styles.helperText}>{helperText}</span>}
      </div>
    );
  }
);

Input.displayName = "Input";
