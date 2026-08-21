"use client";

import React, { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import styles from "./DashboardLayout.module.css";

export interface DashboardLayoutProps {
  title?: string;
  userName?: string;
  userRole?: string;
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  title,
  userName,
  userRole,
  children,
}) => {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className={styles.container}>
      <Sidebar isOpen={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />
      <div className={styles.mainWrapper}>
        <Header
          title={title}
          userName={userName}
          userRole={userRole}
          onMenuToggle={() => setMobileNavOpen(!mobileNavOpen)}
        />
        <main className={styles.content}>{children}</main>
      </div>
    </div>
  );
};
