"use client";

import React, { useState } from "react";
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
import { INITIAL_CUSTOMERS, INITIAL_LOANS, INITIAL_TRANSACTIONS } from "@/lib/data/mockData";
import styles from "./customerProfile.module.css";

export default function CustomerProfilePage() {
  const params = useParams();
  const customerId = (params.id as string) || "cust-0128";

  const customer =
    INITIAL_CUSTOMERS.find((c) => c.id === customerId) || INITIAL_CUSTOMERS[0];
  const customerLoans = INITIAL_LOANS.filter((l) => l.customerId === customer.id);
  const customerTxns = INITIAL_TRANSACTIONS.filter((t) => t.customerId === customer.id);

  const [activeTab, setActiveTab] = useState<"loans" | "ledger" | "documents">("loans");

  const totalLoansCount = customerLoans.length;
  const totalLoanAmount = customerLoans.reduce((sum, l) => sum + l.loanAmount, 0);
  const totalPaidAmount = customerLoans.reduce((sum, l) => sum + l.paidAmount, 0);
  const remainingSthiti = customerLoans.reduce((sum, l) => sum + l.remainingAmount, 0);

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
              <span className={styles.savingsValue}>৳{customer.savingsBalance.toLocaleString()}</span>
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
            <Table
              keyExtractor={(l) => l.id}
              data={customerLoans}
              columns={[
                { header: "Loan Code", accessorKey: "loanCode" },
                { header: "Purpose", accessorKey: "loanPurpose" },
                { header: "Amount", cell: (l) => `৳${l.loanAmount.toLocaleString()}` },
                { header: "Interest", cell: (l) => `${l.interestRate}% (${l.interestType})` },
                { header: "Total Payable", cell: (l) => `৳${l.totalPayable.toLocaleString()}` },
                { header: "Paid Amount", cell: (l) => `৳${l.paidAmount.toLocaleString()}` },
                {
                  header: "Remaining (স্থিতি)",
                  cell: (l) => <strong className="money-text">৳{l.remainingAmount.toLocaleString()}</strong>,
                },
                { header: "Status", cell: (l) => <Badge status={l.status} /> },
              ]}
            />
          </Card>
        )}

        {activeTab === "ledger" && (
          <Card title="Member Dual-Ledger Records (সঞ্চয় ও ঋণ রেজিস্টার)">
            <Table
              keyExtractor={(t) => t.id}
              data={customerTxns}
              columns={[
                { header: "Code", accessorKey: "transactionCode" },
                { header: "Date (তারিখ)", accessorKey: "date" },
                {
                  header: "Type",
                  cell: (t) => (
                    <Badge
                      status={t.type === "INSTALLMENT_PAYMENT" ? "paid" : "active"}
                      label={t.type.replace(/_/g, " ")}
                    />
                  ),
                },
                { header: "Amount (টাকা)", cell: (t) => `৳${t.amount.toLocaleString()}` },
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
