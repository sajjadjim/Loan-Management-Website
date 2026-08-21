"use client";

import React from "react";
import { User, LogOut, Menu } from "lucide-react";
import { Button } from "../ui/Button";
import styles from "./Header.module.css";

export interface HeaderProps {
  title?: string;
  userName?: string;
  userRole?: string;
  onMenuToggle?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title = "Management Dashboard",
  userName = "Admin User",
  userRole = "ADMIN",
  onMenuToggle,
}) => {
  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <button
          className={styles.menuBtn}
          onClick={onMenuToggle}
          aria-label="Toggle Mobile Menu"
        >
          <Menu size={22} />
        </button>
        <h1 className={styles.pageTitle}>{title}</h1>
      </div>

      <div className={styles.right}>
        <div className={styles.userInfo}>
          <div className={styles.avatar}>
            <User size={18} />
          </div>
          <div className={styles.userDetails}>
            <span className={styles.userName}>{userName}</span>
            <span className={styles.userRole}>{userRole}</span>
          </div>
        </div>

        <Button variant="secondary" size="sm" icon={<LogOut size={16} />}>
          <span className={styles.logoutText}>Logout</span>
        </Button>
      </div>
    </header>
  );
};
