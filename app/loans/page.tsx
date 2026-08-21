"use client";

import React, { useState } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Table } from "@/components/ui/Table";
import { Modal } from "@/components/ui/Modal";
import { Search, PlusCircle, Eye, Calendar, DollarSign, Calculator } from "lucide-react";
import { INITIAL_LOANS, MockLoan } from "@/lib/data/mockData";
import { generateInstallmentSchedule } from "@/lib/loan/calculateInstallment";
import styles from "./loans.module.css";

export default function LoansPage() {
  const [loans] = useState<MockLoan[]>(INITIAL_LOANS);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [selectedLoan, setSelectedLoan] = useState<MockLoan | null>(null);

  const filteredLoans = loans.filter((l) => {
    const matchesSearch =
      l.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.memberCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.loanCode.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "ALL" || l.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const schedule = selectedLoan
    ? generateInstallmentSchedule({
        principal: selectedLoan.loanAmount,
        annualRatePercentage: selectedLoan.interestRate,
        durationMonths: selectedLoan.durationMonths,
        totalInstallments: selectedLoan.totalInstallments,
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
          <Table
            keyExtractor={(l) => l.id}
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
                    <strong>{l.customerName}</strong>
                    <div className={styles.subText}>{l.memberCode}</div>
                  </div>
                ),
              },
              { header: "Purpose", accessorKey: "loanPurpose" },
              {
                header: "Sanctioned Amount",
                cell: (l) => <strong>৳{l.loanAmount.toLocaleString()}</strong>,
              },
              {
                header: "Interest",
                cell: (l) => `${l.interestRate}% (${l.interestType})`,
              },
              {
                header: "Installment",
                cell: (l) => `৳${l.installmentAmount.toLocaleString()} / mo`,
              },
              {
                header: "Paid Amount",
                cell: (l) => `৳${l.paidAmount.toLocaleString()}`,
              },
              {
                header: "Remaining Balance (স্থিতি)",
                cell: (l) => (
                  <strong className="money-text">৳{l.remainingAmount.toLocaleString()}</strong>
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
        </Card>

        {/* Schedule Breakdown Modal */}
        {selectedLoan && (
          <Modal
            isOpen={!!selectedLoan}
            onClose={() => setSelectedLoan(null)}
            title={`Installment Schedule: ${selectedLoan.loanCode} (${selectedLoan.customerName})`}
          >
            <div className={styles.modalContent}>
              <div className={styles.loanSummaryBox}>
                <div>
                  <span className={styles.boxLabel}>Original Principal:</span>
                  <strong>৳{selectedLoan.loanAmount.toLocaleString()}</strong>
                </div>
                <div>
                  <span className={styles.boxLabel}>Total Interest:</span>
                  <strong>৳{selectedLoan.totalInterest.toLocaleString()}</strong>
                </div>
                <div>
                  <span className={styles.boxLabel}>Total Payable:</span>
                  <strong>৳{selectedLoan.totalPayable.toLocaleString()}</strong>
                </div>
              </div>

              <h4>Repayment Schedule ({schedule.length} Installments)</h4>
              <Table
                keyExtractor={(s) => `sch-${s.installmentNo}`}
                data={schedule}
                columns={[
                  { header: "No.", accessorKey: "installmentNo" },
                  {
                    header: "Due Date",
                    cell: (s) => s.dueDate.toISOString().split("T")[0],
                  },
                  { header: "Principal", cell: (s) => `৳${s.principalAmount}` },
                  { header: "Interest", cell: (s) => `৳${s.interestAmount}` },
                  { header: "Total Due", cell: (s) => <strong>৳{s.totalDue}</strong> },
                  { header: "Status", cell: (s) => <Badge status={s.status} /> },
                ]}
              />
            </div>
          </Modal>
        )}
      </div>
    </DashboardLayout>
  );
}
