"use client";

import React, { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Table } from "@/components/ui/Table";
import { FileSpreadsheet, Printer, Download, Filter, Calendar } from "lucide-react";
import { INITIAL_CUSTOMERS, INITIAL_LOANS, INITIAL_TRANSACTIONS } from "@/lib/data/mockData";
import styles from "./reports.module.css";

export default function ReportsPage() {
  const [reportType, setReportType] = useState<string>("daily_collection");
  const [startDate, setStartDate] = useState<string>("2024-05-01");
  const [endDate, setEndDate] = useState<string>("2024-08-31");

  const totalCollected = INITIAL_TRANSACTIONS.reduce((acc, t) => acc + t.amount, 0);
  const totalOutstanding = INITIAL_LOANS.reduce((acc, l) => acc + l.remainingAmount, 0);

  const handleExportCSV = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      ["Code,Date,Customer,Type,Amount", ...INITIAL_TRANSACTIONS.map((t) => `${t.transactionCode},${t.date},${t.customerName},${t.type},${t.amount}`)].join("\n");
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
        <Card title="Report Generation Controls">
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
            <strong>৳{totalCollected.toLocaleString()}</strong>
          </div>
          <div className={styles.rCard}>
            <span>Total Outstanding Sthiti:</span>
            <strong>৳{totalOutstanding.toLocaleString()}</strong>
          </div>
          <div className={styles.rCard}>
            <span>Generated Date:</span>
            <strong>{new Date().toISOString().split("T")[0]}</strong>
          </div>
        </div>

        {/* Dynamic Table Report */}
        <Card title={`Generated Report: ${reportType.replace(/_/g, " ").toUpperCase()}`}>
          {reportType === "outstanding" || reportType === "overdue" ? (
            <Table
              keyExtractor={(l) => l.id}
              data={
                reportType === "overdue"
                  ? INITIAL_LOANS.filter((l) => l.status === "OVERDUE")
                  : INITIAL_LOANS
              }
              columns={[
                { header: "Loan Code", accessorKey: "loanCode" },
                { header: "Member Code", accessorKey: "memberCode" },
                { header: "Member Name", accessorKey: "customerName" },
                { header: "Sanctioned Amount", cell: (l) => `৳${l.loanAmount.toLocaleString()}` },
                { header: "Total Paid", cell: (l) => `৳${l.paidAmount.toLocaleString()}` },
                {
                  header: "Remaining Balance (স্থিতি)",
                  cell: (l) => <strong className="money-text">৳{l.remainingAmount.toLocaleString()}</strong>,
                },
                { header: "Status", cell: (l) => <Badge status={l.status} /> },
              ]}
            />
          ) : (
            <Table
              keyExtractor={(t) => t.id}
              data={INITIAL_TRANSACTIONS}
              columns={[
                { header: "Txn Code", accessorKey: "transactionCode" },
                { header: "Date", accessorKey: "date" },
                { header: "Member", accessorKey: "customerName" },
                { header: "Type", accessorKey: "type" },
                { header: "Amount", cell: (t) => `৳${t.amount.toLocaleString()}` },
                { header: "Description", accessorKey: "description" },
                { header: "Collector", accessorKey: "createdBy" },
              ]}
            />
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
