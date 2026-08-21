"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Table } from "@/components/ui/Table";
import {
  Users,
  Banknote,
  TrendingUp,
  AlertTriangle,
  Receipt,
  PlusCircle,
  CheckCircle2,
  DollarSign,
  RefreshCw,
} from "lucide-react";
import styles from "./dashboard.module.css";

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<any>({
    totalMembers: 0,
    activeLoansCount: 0,
    overdueLoansCount: 0,
    totalDisbursed: 0,
    totalCollected: 0,
    totalOutstanding: 0,
    overdueAmount: 0,
    totalSavings: 0,
    recentLoans: [],
    recentTransactions: [],
  });
  const [loading, setLoading] = useState(true);

  const fetchDashboardMetrics = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/dashboard");
      const json = await res.json();
      if (json.success && json.data) {
        setMetrics(json.data);
      }
    } catch (err) {
      console.error("Failed to load dashboard metrics from Supabase:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardMetrics();
  }, []);

  return (
    <DashboardLayout title="Executive Overview (Live Supabase)" userName="Admin User" userRole="ADMIN">
      <div className={styles.dashboardContainer}>
        {/* Quick Actions Bar */}
        <div className={styles.quickBar}>
          <div>
            <h2 className={styles.welcomeText}>Welcome back, Admin</h2>
            <p className={styles.subText}>Live Supabase PostgreSQL financial & loan portfolio metrics.</p>
          </div>
          <div className={styles.actionButtons}>
            <Link href="/collections">
              <Button variant="success" icon={<Receipt size={18} />}>
                Record Collection (আদায়ী)
              </Button>
            </Link>
            <Link href="/loans/new">
              <Button variant="primary" icon={<PlusCircle size={18} />}>
                Issue New Loan (নতুন ঋণ)
              </Button>
            </Link>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className={styles.metricsGrid}>
          <Card hoverable className={styles.metricCard}>
            <div className={styles.metricHeader}>
              <span className={styles.metricLabel}>Total Members</span>
              <div className={`${styles.iconBg} ${styles.blueBg}`}>
                <Users size={20} />
              </div>
            </div>
            <div className={styles.metricValue}>{loading ? "..." : metrics.totalMembers}</div>
            <div className={styles.metricFooter}>
              <span className={styles.badgeSuccess}>PostgreSQL Members Table</span>
            </div>
          </Card>

          <Card hoverable className={styles.metricCard}>
            <div className={styles.metricHeader}>
              <span className={styles.metricLabel}>Active Loans</span>
              <div className={`${styles.iconBg} ${styles.indigoBg}`}>
                <Banknote size={20} />
              </div>
            </div>
            <div className={styles.metricValue}>{loading ? "..." : metrics.activeLoansCount}</div>
            <div className={styles.metricFooter}>
              <span>Disbursed: ৳{loading ? "0" : metrics.totalDisbursed.toLocaleString()}</span>
            </div>
          </Card>

          <Card hoverable className={styles.metricCard}>
            <div className={styles.metricHeader}>
              <span className={styles.metricLabel}>Total Collected</span>
              <div className={`${styles.iconBg} ${styles.emeraldBg}`}>
                <TrendingUp size={20} />
              </div>
            </div>
            <div className={styles.metricValue}>
              ৳{loading ? "0" : metrics.totalCollected.toLocaleString()}
            </div>
            <div className={styles.metricFooter}>
              <span className={styles.textSuccess}>+ 100% Real-time Database</span>
            </div>
          </Card>

          <Card hoverable className={styles.metricCard}>
            <div className={styles.metricHeader}>
              <span className={styles.metricLabel}>Total Outstanding (স্থিতি)</span>
              <div className={`${styles.iconBg} ${styles.amberBg}`}>
                <DollarSign size={20} />
              </div>
            </div>
            <div className={styles.metricValue}>
              ৳{loading ? "0" : metrics.totalOutstanding.toLocaleString()}
            </div>
            <div className={styles.metricFooter}>
              <span>Remaining Loan Sthiti Balance</span>
            </div>
          </Card>

          <Card hoverable className={styles.metricCard}>
            <div className={styles.metricHeader}>
              <span className={styles.metricLabel}>Overdue Balance</span>
              <div className={`${styles.iconBg} ${styles.roseBg}`}>
                <AlertTriangle size={20} />
              </div>
            </div>
            <div className={styles.metricValue}>
              ৳{loading ? "0" : metrics.overdueAmount.toLocaleString()}
            </div>
            <div className={styles.metricFooter}>
              <span className={styles.textDanger}>{metrics.overdueLoansCount} Accounts overdue</span>
            </div>
          </Card>

          <Card hoverable className={styles.metricCard}>
            <div className={styles.metricHeader}>
              <span className={styles.metricLabel}>Total Savings Vault</span>
              <div className={`${styles.iconBg} ${styles.cyanBg}`}>
                <CheckCircle2 size={20} />
              </div>
            </div>
            <div className={styles.metricValue}>
              ৳{loading ? "0" : metrics.totalSavings.toLocaleString()}
            </div>
            <div className={styles.metricFooter}>
              <span>Members' Total Savings</span>
            </div>
          </Card>
        </div>

        {/* Content Section: Tables */}
        <div className={styles.tablesGrid}>
          <Card title="Recent Loans Portfolio" action={<Link href="/loans">View All Loans</Link>}>
            <Table<any>
              keyExtractor={(item: any) => item.id}
              data={metrics.recentLoans}
              columns={[
                { header: "Member", cell: (l: any) => <strong>{l.customer?.fullName}</strong> },
                { header: "Member ID", cell: (l: any) => l.customer?.memberCode },
                { header: "Sanctioned", cell: (l: any) => `৳${Number(l.loanAmount).toLocaleString()}` },
                { header: "Paid", cell: (l: any) => `৳${Number(l.paidAmount).toLocaleString()}` },
                {
                  header: "Balance (স্থিতি)",
                  cell: (l: any) => <span className="money-text">৳{Number(l.remainingAmount).toLocaleString()}</span>,
                },
                { header: "Status", cell: (l: any) => <Badge status={l.status} /> },
              ]}
            />
          </Card>

          <Card title="Recent Supabase Transactions" action={<Link href="/transactions">View History</Link>}>
            <Table<any>
              keyExtractor={(item: any) => item.id}
              data={metrics.recentTransactions}
              columns={[
                { header: "Code", accessorKey: "transactionCode" },
                { header: "Member", cell: (t: any) => t.customer?.fullName },
                {
                  header: "Type",
                  cell: (t: any) => (
                    <Badge
                      status={
                        t.type === "INSTALLMENT_PAYMENT"
                          ? "paid"
                          : t.type === "LOAN_DISBURSEMENT"
                          ? "info"
                          : "active"
                      }
                      label={(t.type || "").replace(/_/g, " ")}
                    />
                  ),
                },
                { header: "Amount", cell: (t: any) => `৳${Number(t.amount).toLocaleString()}` },
              ]}
            />
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
