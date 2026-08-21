"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Banknote,
  Receipt,
  History,
  FileSpreadsheet,
  ShieldCheck,
  Building2,
  X,
} from "lucide-react";
import styles from "./Sidebar.module.css";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Members / Customers", href: "/customers", icon: Users },
  { label: "Loan Management", href: "/loans", icon: Banknote },
  { label: "Collect / Deposit", href: "/collections", icon: Receipt },
  { label: "Transactions", href: "/transactions", icon: History },
  { label: "Financial Reports", href: "/reports", icon: FileSpreadsheet },
  { label: "Audit Trail", href: "/audit-logs", icon: ShieldCheck },
];

export interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen = false, onClose }) => {
  const pathname = usePathname();

  return (
    <>
      {isOpen && <div className={styles.overlay} onClick={onClose} />}
      <aside className={`${styles.sidebar} ${isOpen ? styles.open : ""}`}>
        <div className={styles.brand}>
          <div className={styles.brandLeft}>
            <div className={styles.brandIcon}>
              <Building2 size={20} />
            </div>
            <span>LoanManager</span>
          </div>

          <button className={styles.closeMobileBtn} onClick={onClose} aria-label="Close menu">
            <X size={20} />
          </button>
        </div>

        <nav className={styles.nav}>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`${styles.navItem} ${isActive ? styles.active : ""}`}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className={styles.footer}>
          <div>Member Loan System v1.0</div>
          <div>Mobile Priority Edition</div>
        </div>
      </aside>
    </>
  );
};
