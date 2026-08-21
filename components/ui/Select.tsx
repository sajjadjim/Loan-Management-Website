import React, { SelectHTMLAttributes, forwardRef } from "react";
import styles from "./Select.module.css";

export interface SelectOption {
  label: string;
  value: string | number;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  error?: string;
  required?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, options, error, required, className = "", ...props }, ref) => {
    return (
      <div className={`${styles.container} ${error ? styles.hasError : ""} ${className}`}>
        {label && (
          <label className={styles.label}>
            {label}
            {required && <span className={styles.required}>*</span>}
          </label>
        )}
        <select ref={ref} className={styles.select} {...props}>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <span className={styles.errorMsg}>{error}</span>}
      </div>
    );
  }
);

Select.displayName = "Select";
