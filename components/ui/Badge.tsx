import React from "react";
import styles from "./Badge.module.css";

export type BadgeStatus =
  | "active"
  | "success"
  | "paid"
  | "completed"
  | "pending"
  | "warning"
  | "partiallyPaid"
  | "overdue"
  | "danger"
  | "cancelled"
  | "suspended"
  | "info"
  | "inactive";

export interface BadgeProps {
  status: BadgeStatus | string;
  label?: string;
  showDot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({ status, label, showDot = true }) => {
  const normalizedStatus = (status || "").toLowerCase().replace(/_/g, "");
  
  let variantClass = styles.info;
  if (["active", "success", "paid", "completed"].includes(normalizedStatus)) {
    variantClass = styles.active;
  } else if (["pending", "warning", "partiallypaid"].includes(normalizedStatus)) {
    variantClass = styles.pending;
  } else if (["overdue", "danger", "cancelled", "suspended"].includes(normalizedStatus)) {
    variantClass = styles.overdue;
  }

  const displayLabel = label || status.replace(/_/g, " ");

  return (
    <span className={`${styles.badge} ${variantClass}`}>
      {showDot && <span className={styles.dot} />}
      {displayLabel}
    </span>
  );
};
