"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Table } from "@/components/ui/Table";
import { Modal } from "@/components/ui/Modal";
import { Search, PlusCircle, Eye } from "lucide-react";
import { generateInstallmentSchedule } from "@/lib/loan/calculateInstallment";
import styles from "./loans.module.css";

export default function LoansPage() {
  const [loans, setLoans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [selectedLoan, setSelectedLoan] = useState<any | null>(null);

  const fetchLoansFromDb = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/loans?status=${encodeURIComponent(statusFilter)}`);
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setLoans(json.data);
      }
    } catch (err) {
      console.error("Failed to load loans from PostgreSQL database:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoansFromDb();
  }, [statusFilter]);

  const filteredLoans = loans.filter((l) => {
    const customerName = l.customer?.fullName || l.customerName || "";
    const memberCode = l.customer?.memberCode || l.memberCode || "";
    const loanCode = l.loanCode || "";

    return (
      customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      memberCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loanCode.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const schedule = selectedLoan
    ? selectedLoan.installments && selectedLoan.installments.length > 0
      ? selectedLoan.installments.map((inst: any) => ({
          installmentNo: inst.installmentNo,
          dueDate: new Date(inst.dueDate),
          principalAmount: Number(inst.principalAmount),
          interestAmount: Number(inst.interestAmount),
          totalDue: Number(inst.totalDue),
          status: inst.status,
        }))
      : generateInstallmentSchedule({
          principal: Number(selectedLoan.loanAmount),
          annualRatePercentage: Number(selectedLoan.interestRate),
          durationMonths: Number(selectedLoan.durationMonths),
          totalInstallments: Number(selectedLoan.totalInstallments),
          startDate: new Date(selectedLoan.startDate),
          frequency: selectedLoan.frequency,
          interestType: selectedLoan.interestType,
        })
    : [];

  return (
    <DashboardLayout title="Loan Portfolio Management" userName="Admin User" userRole="ADMIN">
      <div className={styles.container}>
        <div className={styles.topBar}>
          <div className={styles.filtersGroup}>
            <div className={styles.searchBox}>
              <Input
                placeholder="Search by loan code, member name, or code..."
                prefixIcon={<Search size={18} />}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className={styles.statusSelect}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active (চলতি)</option>
              <option value="OVERDUE">Overdue (খেলাপি)</option>
              <option value="COMPLETED">Completed (পরিশোধিত)</option>
              <option value="PENDING">Pending (অপেক্ষমাণ)</option>
            </select>
          </div>

          <Link href="/loans/new">
            <Button variant="primary" icon={<PlusCircle size={18} />}>
              Issue New Loan (নতুন ঋণ বিতরণ)
            </Button>
          </Link>
        </div>

        <Card title={`Loans Registry (${filteredLoans.length})`}>
          {loading ? (
            <div style={{ padding: "2rem", textAlign: "center", color: "var(--text-muted)" }}>
              Loading loan portfolio from database...
            </div>
          ) : (
            <Table<any>
              keyExtractor={(l: any) => l.id}
              data={filteredLoans}
              columns={[
                {
                  header: "Loan Code",
                  cell: (l) => <span className={styles.codeText}>{l.loanCode}</span>,
                },
                {
                  header: "Member",
                  cell: (l) => (
                    <div>
                      <strong>{l.customer?.fullName || l.customerName}</strong>
                      <div className={styles.subText}>{l.customer?.memberCode || l.memberCode}</div>
                    </div>
                  ),
                },
                { header: "Purpose", accessorKey: "loanPurpose" },
                {
                  header: "Sanctioned Amount",
                  cell: (l) => <strong>৳{Number(l.loanAmount).toLocaleString()}</strong>,
                },
                {
                  header: "Interest",
                  cell: (l) => `${Number(l.interestRate)}% (${l.interestType})`,
                },
                {
                  header: "Installment",
                  cell: (l) => `৳${Number(l.installmentAmount).toLocaleString()} / mo`,
                },
                {
                  header: "Paid Amount",
                  cell: (l) => `৳${Number(l.paidAmount).toLocaleString()}`,
                },
                {
                  header: "Remaining Balance (স্থিতি)",
                  cell: (l) => (
                    <strong className="money-text">৳{Number(l.remainingAmount).toLocaleString()}</strong>
                  ),
                },
                {
                  header: "Status",
                  cell: (l) => <Badge status={l.status} />,
                },
                {
                  header: "Actions",
                  cell: (l) => (
                    <Button
                      variant="secondary"
                      size="sm"
                      icon={<Eye size={14} />}
                      onClick={() => setSelectedLoan(l)}
                    >
                      Schedule
                    </Button>
                  ),
                },
              ]}
            />
          )}
        </Card>

        {/* Schedule Breakdown Modal */}
        {selectedLoan && (
          <Modal
            isOpen={!!selectedLoan}
            onClose={() => setSelectedLoan(null)}
            title={`Installment Schedule: ${selectedLoan.loanCode} (${
              selectedLoan.customer?.fullName || selectedLoan.customerName
            })`}
          >
            <div className={styles.modalContent}>
              <div className={styles.loanSummaryBox}>
                <div>
                  <span className={styles.boxLabel}>Original Principal:</span>
                  <strong>৳{Number(selectedLoan.loanAmount).toLocaleString()}</strong>
                </div>
                <div>
                  <span className={styles.boxLabel}>Total Interest:</span>
                  <strong>৳{Number(selectedLoan.totalInterest).toLocaleString()}</strong>
                </div>
                <div>
                  <span className={styles.boxLabel}>Total Payable:</span>
                  <strong>৳{Number(selectedLoan.totalPayable).toLocaleString()}</strong>
                </div>
              </div>

              <h4>Repayment Schedule ({schedule.length} Installments)</h4>
              <Table<any>
                keyExtractor={(s: any) => `sch-${s.installmentNo}`}
                data={schedule}
                columns={[
                  { header: "No.", accessorKey: "installmentNo" },
                  {
                    header: "Due Date",
                    cell: (s: any) =>
                      s.dueDate instanceof Date
                        ? s.dueDate.toISOString().split("T")[0]
                        : String(s.dueDate).split("T")[0],
                  },
                  { header: "Principal", cell: (s: any) => `৳${Number(s.principalAmount).toLocaleString()}` },
                  { header: "Interest", cell: (s: any) => `৳${Number(s.interestAmount).toLocaleString()}` },
                  { header: "Total Due", cell: (s: any) => <strong>৳{Number(s.totalDue).toLocaleString()}</strong> },
                  { header: "Status", cell: (s: any) => <Badge status={s.status} /> },
                ]}
              />
            </div>
          </Modal>
        )}
      </div>
    </DashboardLayout>
  );
}
