"use client";

import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Table } from "@/components/ui/Table";
import { Printer, Download } from "lucide-react";
import styles from "./reports.module.css";

export default function ReportsPage() {
  const [reportType, setReportType] = useState<string>("daily_collection");
  const [startDate, setStartDate] = useState<string>(
    new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );

  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState<{
    totalCollected: number;
    totalOutstanding: number;
    generatedAt: string;
    rows: any[];
  }>({
    totalCollected: 0,
    totalOutstanding: 0,
    generatedAt: new Date().toISOString(),
    rows: [],
  });

  const fetchReportFromDb = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        reportType,
        startDate,
        endDate,
      }).toString();

      const res = await fetch(`/api/reports?${query}`);
      const json = await res.json();
      if (json.success && json.data) {
        setReportData({
          totalCollected: json.data.totalCollected || 0,
          totalOutstanding: json.data.totalOutstanding || 0,
          generatedAt: json.data.generatedAt || new Date().toISOString(),
          rows: json.data.rows || [],
        });
      }
    } catch (err) {
      console.error("Failed to load reports from PostgreSQL database:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportFromDb();
  }, [reportType, startDate, endDate]);

  const handleExportCSV = () => {
    if (!reportData.rows || reportData.rows.length === 0) {
      alert("No data available to export.");
      return;
    }

    let csvHeader = "";
    let csvRows: string[] = [];

    if (reportType === "outstanding" || reportType === "overdue") {
      csvHeader = "LoanCode,MemberCode,MemberName,LoanAmount,PaidAmount,RemainingAmount,Status";
      csvRows = reportData.rows.map(
        (l) =>
          `"${l.loanCode}","${l.customer?.memberCode || ""}","${l.customer?.fullName || ""}","${l.loanAmount}","${l.paidAmount}","${l.remainingAmount}","${l.status}"`
      );
    } else if (reportType === "member_summary") {
      csvHeader = "MemberCode,MemberName,Phone,SavingsBalance,LoansCount,Status";
      csvRows = reportData.rows.map(
        (c) =>
          `"${c.memberCode}","${c.fullName}","${c.phone}","${c.savingsAccount?.currentBalance || 0}","${c.loans?.length || 0}","${c.status}"`
      );
    } else {
      csvHeader = "TxnCode,Date,MemberName,MemberCode,Type,Amount,Description";
      csvRows = reportData.rows.map(
        (t) =>
          `"${t.transactionCode}","${
            t.transactionDate ? String(t.transactionDate).split("T")[0] : ""
          }","${t.customer?.fullName || ""}","${t.customer?.memberCode || ""}","${t.type}","${t.amount}","${(t.description || "").replace(/"/g, '""')}"`
      );
    }

    const csvContent = "data:text/csv;charset=utf-8," + [csvHeader, ...csvRows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `report_${reportType}_${startDate}_to_${endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <DashboardLayout title="Financial & Audit Reports" userName="Admin User" userRole="ADMIN">
      <div className={styles.container}>
        {/* Controls & Filter Bar */}
        <Card title="Report Generation Controls (PostgreSQL Database Synced)">
          <div className={styles.filterControls}>
            <div className={styles.field}>
              <label className={styles.label}>Select Report Type</label>
              <select
                className={styles.select}
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
              >
                <option value="daily_collection">Daily Collection Report (দৈনিক আদায়)</option>
                <option value="monthly_collection">Monthly Collection Report (মাসিক আদায়)</option>
                <option value="outstanding">Outstanding Loans Report (বকেয়া স্থিতি)</option>
                <option value="overdue">Overdue Loans Report (খেলাপি ঋণ)</option>
                <option value="member_summary">Member Directory & Savings Report</option>
              </select>
            </div>

            <Input
              label="Start Date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />

            <Input
              label="End Date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />

            <div className={styles.actionGroup}>
              <Button variant="secondary" icon={<Printer size={16} />} onClick={() => window.print()}>
                Print Report
              </Button>
              <Button variant="primary" icon={<Download size={16} />} onClick={handleExportCSV}>
                Export CSV / Excel
              </Button>
            </div>
          </div>
        </Card>

        {/* Report Output Header */}
        <div className={styles.reportSummaryCards}>
          <div className={styles.rCard}>
            <span>Total Collections (Period):</span>
            <strong>৳{reportData.totalCollected.toLocaleString()}</strong>
          </div>
          <div className={styles.rCard}>
            <span>Total Outstanding Sthiti:</span>
            <strong>৳{reportData.totalOutstanding.toLocaleString()}</strong>
          </div>
          <div className={styles.rCard}>
            <span>Generated Date:</span>
            <strong>{reportData.generatedAt.split("T")[0]}</strong>
          </div>
        </div>

        {/* Dynamic Table Report */}
        <Card title={`Generated Report: ${reportType.replace(/_/g, " ").toUpperCase()} (${reportData.rows.length} Records)`}>
          {loading ? (
            <div style={{ padding: "2rem", textAlign: "center", color: "var(--text-muted)" }}>
              Generating report from PostgreSQL database...
            </div>
          ) : reportType === "outstanding" || reportType === "overdue" ? (
            <Table<any>
              keyExtractor={(l: any) => l.id}
              data={reportData.rows}
              columns={[
                { header: "Loan Code", accessorKey: "loanCode" },
                {
                  header: "Member Code",
                  cell: (l: any) => l.customer?.memberCode || "N/A",
                },
                {
                  header: "Member Name",
                  cell: (l: any) => <strong>{l.customer?.fullName || "N/A"}</strong>,
                },
                {
                  header: "Sanctioned Amount",
                  cell: (l: any) => `৳${Number(l.loanAmount || 0).toLocaleString()}`,
                },
                {
                  header: "Total Paid",
                  cell: (l: any) => `৳${Number(l.paidAmount || 0).toLocaleString()}`,
                },
                {
                  header: "Remaining Balance (স্থিতি)",
                  cell: (l: any) => (
                    <strong className="money-text">
                      ৳{Number(l.remainingAmount || 0).toLocaleString()}
                    </strong>
                  ),
                },
                { header: "Status", cell: (l: any) => <Badge status={l.status} /> },
              ]}
            />
          ) : reportType === "member_summary" ? (
            <Table<any>
              keyExtractor={(c: any) => c.id}
              data={reportData.rows}
              columns={[
                { header: "Member Code", accessorKey: "memberCode" },
                { header: "Member Name", cell: (c: any) => <strong>{c.fullName}</strong> },
                { header: "Mobile Phone", accessorKey: "phone" },
                {
                  header: "Savings Vault",
                  cell: (c: any) => (
                    <span className="money-text">
                      ৳{Number(c.savingsAccount?.currentBalance || 0).toLocaleString()}
                    </span>
                  ),
                },
                {
                  header: "Active Loans Count",
                  cell: (c: any) => c.loans?.length || 0,
                },
                { header: "Status", cell: (c: any) => <Badge status={c.status} /> },
              ]}
            />
          ) : (
            <Table<any>
              keyExtractor={(t: any) => t.id}
              data={reportData.rows}
              columns={[
                { header: "Txn Code", accessorKey: "transactionCode" },
                {
                  header: "Date",
                  cell: (t: any) =>
                    t.transactionDate
                      ? String(t.transactionDate).split("T")[0]
                      : "N/A",
                },
                {
                  header: "Member",
                  cell: (t: any) => (
                    <div>
                      <strong>{t.customer?.fullName || "N/A"}</strong>
                      <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                        {t.customer?.memberCode || ""}
                      </div>
                    </div>
                  ),
                },
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
                {
                  header: "Amount",
                  cell: (t: any) => `৳${Number(t.amount || 0).toLocaleString()}`,
                },
                { header: "Description", accessorKey: "description" },
                {
                  header: "Collector",
                  cell: (t: any) => t.user?.fullName || t.createdBy || "Admin User",
                },
              ]}
            />
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
