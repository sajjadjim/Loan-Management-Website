import React from "react";
import styles from "./Card.module.css";

export interface CardProps {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  footer?: React.ReactNode;
  hoverable?: boolean;
  className?: string;
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  action,
  footer,
  hoverable = false,
  className = "",
  children,
}) => {
  return (
    <div className={`${styles.card} ${hoverable ? styles.hoverable : ""} ${className}`}>
      {(title || action) && (
        <div className={styles.header}>
          <div>
            {title && <h3 className={styles.title}>{title}</h3>}
            {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className={styles.content}>{children}</div>
      {footer && <div className={styles.footer}>{footer}</div>}
    </div>
  );
};
