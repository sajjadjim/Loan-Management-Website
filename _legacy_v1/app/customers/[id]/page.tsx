"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Table } from "@/components/ui/Table";
import {
  User,
  Phone,
  MapPin,
  Calendar,
  CreditCard,
  Banknote,
  Receipt,
  FileCheck,
  ArrowLeft,
  Lock,
  Download,
} from "lucide-react";
import styles from "./customerProfile.module.css";

export default function CustomerProfilePage() {
  const params = useParams();
  const customerId = params.id as string;

  const [customer, setCustomer] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"loans" | "ledger" | "documents">("loans");

  useEffect(() => {
    fetch("/api/customers")
      .then((res) => res.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data)) {
          const found = json.data.find((c: any) => c.id === customerId);
          if (found) setCustomer(found);
        }
      })
      .catch((err) => console.error("Error loading customer profile:", err))
      .finally(() => setLoading(false));
  }, [customerId]);

  if (loading) {
    return (
      <DashboardLayout title="Member Profile" userName="Admin User" userRole="ADMIN">
        <div style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)" }}>
          Loading member details from PostgreSQL database...
        </div>
      </DashboardLayout>
    );
  }

  if (!customer) {
    return (
      <DashboardLayout title="Member Not Found" userName="Admin User" userRole="ADMIN">
        <div style={{ padding: "3rem", textAlign: "center" }}>
          <p style={{ marginBottom: "1rem" }}>Member record not found in database.</p>
          <Link href="/customers">
            <Button variant="primary" icon={<ArrowLeft size={16} />}>
              Back to Members List
            </Button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const customerLoans = customer.loans || [];
  const customerTxns = customer.transactions || [];

  const totalLoansCount = customerLoans.length;
  const totalLoanAmount = customerLoans.reduce((sum: number, l: any) => sum + Number(l.loanAmount || 0), 0);
  const totalPaidAmount = customerLoans.reduce((sum: number, l: any) => sum + Number(l.paidAmount || 0), 0);
  const remainingSthiti = customerLoans.reduce((sum: number, l: any) => sum + Number(l.remainingAmount || 0), 0);
  const savingsBalance = Number(customer.savingsAccount?.currentBalance || 0);

  return (
    <DashboardLayout
      title={`Member Profile: ${customer.fullName}`}
      userName="Admin User"
      userRole="ADMIN"
    >
      <div className={styles.container}>
        {/* Back Link */}
        <div className={styles.backBar}>
          <Link href="/customers" className={styles.backLink}>
            <ArrowLeft size={16} /> Back to Members List
          </Link>
        </div>

        {/* Header Profile Card */}
        <Card className={styles.profileHeaderCard}>
          <div className={styles.profileHeader}>
            <div className={styles.avatarLarge}>{customer.fullName.charAt(0)}</div>
            <div className={styles.profileDetails}>
              <div className={styles.nameRow}>
                <h2 className={styles.memberName}>{customer.fullName}</h2>
                <span className={styles.memberBadge}>{customer.memberCode}</span>
                <Badge status={customer.status} />
              </div>
              <div className={styles.metaRow}>
                <span>
                  <Phone size={14} className={styles.icon} /> {customer.phone}
                </span>
                <span>
                  <CreditCard size={14} className={styles.icon} /> NID: {customer.nidNumber || "N/A"}
                </span>
                <span>
                  <MapPin size={14} className={styles.icon} /> {customer.address || "N/A"}
                </span>
                <span>
                  <Calendar size={14} className={styles.icon} /> Joined: {customer.joiningDate}
                </span>
              </div>
            </div>
            <div className={styles.savingsCard}>
              <span className={styles.savingsLabel}>Savings Balance (মোট সঞ্চয়)</span>
              <span className={styles.savingsValue}>৳{savingsBalance.toLocaleString()}</span>
            </div>
          </div>
        </Card>

        {/* Financial Stat Cards */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Total Loans Issued</span>
            <span className={styles.statValue}>{totalLoansCount}</span>
            <span className={styles.statSub}>৳{totalLoanAmount.toLocaleString()} Principal</span>
          </div>

          <div className={styles.statCard}>
            <span className={styles.statLabel}>Total Paid (আদায়কৃত)</span>
            <span className={`${styles.statValue} ${styles.greenText}`}>
              ৳{totalPaidAmount.toLocaleString()}
            </span>
            <span className={styles.statSub}>Loan repayment</span>
          </div>

          <div className={styles.statCard}>
            <span className={styles.statLabel}>Remaining Loan Balance (স্থিতি)</span>
            <span className={`${styles.statValue} ${styles.amberText}`}>
              ৳{remainingSthiti.toLocaleString()}
            </span>
            <span className={styles.statSub}>Current outstanding</span>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className={styles.tabsBar}>
          <button
            className={`${styles.tabBtn} ${activeTab === "loans" ? styles.activeTab : ""}`}
            onClick={() => setActiveTab("loans")}
          >
            <Banknote size={16} /> Loan History ({customerLoans.length})
          </button>
          <button
            className={`${styles.tabBtn} ${activeTab === "ledger" ? styles.activeTab : ""}`}
            onClick={() => setActiveTab("ledger")}
          >
            <Receipt size={16} /> Ledger & Transactions ({customerTxns.length})
          </button>
          <button
            className={`${styles.tabBtn} ${activeTab === "documents" ? styles.activeTab : ""}`}
            onClick={() => setActiveTab("documents")}
          >
            <Lock size={16} /> Private Documents (3)
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "loans" && (
          <Card title="Member Loan Contracts">
            <Table<any>
              keyExtractor={(l: any) => l.id}
              data={customerLoans}
              columns={[
                { header: "Loan Code", accessorKey: "loanCode" },
                { header: "Purpose", accessorKey: "loanPurpose" },
                { header: "Amount", cell: (l: any) => `৳${Number(l.loanAmount).toLocaleString()}` },
                { header: "Interest", cell: (l: any) => `${Number(l.interestRate)}% (${l.interestType})` },
                { header: "Total Payable", cell: (l: any) => `৳${Number(l.totalPayable).toLocaleString()}` },
                { header: "Paid Amount", cell: (l: any) => `৳${Number(l.paidAmount).toLocaleString()}` },
                {
                  header: "Remaining (স্থিতি)",
                  cell: (l: any) => <strong className="money-text">৳{Number(l.remainingAmount).toLocaleString()}</strong>,
                },
                { header: "Status", cell: (l: any) => <Badge status={l.status} /> },
              ]}
            />
          </Card>
        )}

        {activeTab === "ledger" && (
          <Card title="Member Dual-Ledger Records (সঞ্চয় ও ঋণ রেজিস্টার)">
            <Table<any>
              keyExtractor={(t: any) => t.id}
              data={customerTxns}
              columns={[
                { header: "Code", accessorKey: "transactionCode" },
                {
                  header: "Date (তারিখ)",
                  cell: (t: any) => (t.transactionDate ? String(t.transactionDate).split("T")[0] : t.date || "N/A"),
                },
                {
                  header: "Type",
                  cell: (t: any) => (
                    <Badge
                      status={t.type === "INSTALLMENT_PAYMENT" ? "paid" : "active"}
                      label={(t.type || "").replace(/_/g, " ")}
                    />
                  ),
                },
                { header: "Amount (টাকা)", cell: (t: any) => `৳${Number(t.amount).toLocaleString()}` },
                { header: "Reference", accessorKey: "referenceNo" },
                { header: "Description", accessorKey: "description" },
                { header: "Collector", accessorKey: "createdBy" },
              ]}
            />
          </Card>
        )}

        {activeTab === "documents" && (
          <Card title="Encrypted Member Documents (Security Photos & NID)">
            <div className={styles.documentsGrid}>
              <div className={styles.docCard}>
                <FileCheck size={32} className={styles.docIcon} />
                <div className={styles.docInfo}>
                  <strong>Member Security Photo</strong>
                  <span>Google Drive Ref ID: `DRV-99213-PHOTO`</span>
                  <span className={styles.docSize}>124 KB • Uploaded 2024-05-10</span>
                </div>
                <Button variant="secondary" size="sm" icon={<Download size={14} />}>
                  Secure View
                </Button>
              </div>

              <div className={styles.docCard}>
                <FileCheck size={32} className={styles.docIcon} />
                <div className={styles.docInfo}>
                  <strong>National ID (Front Side)</strong>
                  <span>Google Drive Ref ID: `DRV-99214-NID-FRONT`</span>
                  <span className={styles.docSize}>148 KB • Uploaded 2024-05-10</span>
                </div>
                <Button variant="secondary" size="sm" icon={<Download size={14} />}>
                  Secure View
                </Button>
              </div>

              <div className={styles.docCard}>
                <FileCheck size={32} className={styles.docIcon} />
                <div className={styles.docInfo}>
                  <strong>National ID (Back Side)</strong>
                  <span>Google Drive Ref ID: `DRV-99215-NID-BACK`</span>
                  <span className={styles.docSize}>132 KB • Uploaded 2024-05-10</span>
                </div>
                <Button variant="secondary" size="sm" icon={<Download size={14} />}>
                  Secure View
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
