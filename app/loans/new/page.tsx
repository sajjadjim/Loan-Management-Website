"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ArrowLeft, Calculator, CheckCircle, Banknote } from "lucide-react";
import { computeLoanSummary } from "@/lib/loan/loanSummary";
import { generateInstallmentSchedule } from "@/lib/loan/calculateInstallment";
import styles from "./newLoan.module.css";

export default function NewLoanPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<any[]>([]);
  const [loadingCustomers, setLoadingCustomers] = useState(true);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Fetch registered members from PostgreSQL database
  useEffect(() => {
    fetch("/api/customers")
      .then((res) => res.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          setCustomers(json.data);
          setSelectedCustomerId(json.data[0].id);
        }
      })
      .catch((err) => console.error("Error loading customers from database:", err))
      .finally(() => setLoadingCustomers(false));
  }, []);

  // Loan Form State
  const [principal, setPrincipal] = useState(100000);
  const [interestRate, setInterestRate] = useState(10);
  const [interestType, setInterestType] = useState<"FLAT" | "REDUCING">("FLAT");
  const [durationMonths, setDurationMonths] = useState(6);
  const [frequency, setFrequency] = useState<"DAILY" | "WEEKLY" | "MONTHLY">("MONTHLY");
  const [totalInstallments, setTotalInstallments] = useState(6);
  const [loanPurpose, setLoanPurpose] = useState("ব্যবসা বিস্তার");
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);

  // Automated Calculation
  const summary = computeLoanSummary(
    principal,
    interestRate,
    durationMonths,
    totalInstallments,
    0,
    interestType
  );

  const previewSchedule = generateInstallmentSchedule({
    principal,
    annualRatePercentage: interestRate,
    durationMonths,
    totalInstallments,
    startDate: new Date(startDate),
    frequency,
    interestType,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId) {
      alert("Please select a valid member from the database.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/loans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: selectedCustomerId,
          loanAmount: Number(principal),
          interestRate: Number(interestRate),
          interestType,
          durationMonths: Number(durationMonths),
          frequency,
          totalInstallments: Number(totalInstallments),
          loanPurpose,
          startDate,
        }),
      });

      const json = await res.json();
      if (json.success) {
        alert("Loan contract successfully created and saved to PostgreSQL database!");
        router.push("/loans");
      } else {
        alert(`Error creating loan: ${json.error || "Unknown error"}`);
      }
    } catch (err: any) {
      alert("Failed to connect to database server: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout title="Issue New Loan Contract" userName="Admin User" userRole="ADMIN">
      <div className={styles.container}>
        <div className={styles.backBar}>
          <Link href="/loans" className={styles.backLink}>
            <ArrowLeft size={16} /> Back to Loans Portfolio
          </Link>
        </div>

        <div className={styles.formGrid}>
          {/* Form */}
          <Card title="Loan Application Details (Database Synced)">
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.field}>
                <label className={styles.label}>Select Member (সদস্য নির্বাচন)</label>
                <select
                  className={styles.select}
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  disabled={loadingCustomers || customers.length === 0}
                >
                  {loadingCustomers ? (
                    <option value="">Loading members from database...</option>
                  ) : customers.length === 0 ? (
                    <option value="">No members found in database</option>
                  ) : (
                    customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.fullName} ({c.memberCode}) - {c.phone}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div className={styles.row}>
                <Input
                  label="Sanctioned Loan Amount (ঋণের পরিমাণ ৳)"
                  type="number"
                  value={principal}
                  onChange={(e) => setPrincipal(Number(e.target.value))}
                  required
                />
                <Input
                  label="Annual Interest Rate (%)"
                  type="number"
                  value={interestRate}
                  onChange={(e) => setInterestRate(Number(e.target.value))}
                  required
                />
              </div>

              <div className={styles.row}>
                <div className={styles.field}>
                  <label className={styles.label}>Interest Type</label>
                  <select
                    className={styles.select}
                    value={interestType}
                    onChange={(e) => setInterestType(e.target.value as "FLAT" | "REDUCING")}
                  >
                    <option value="FLAT">Flat Rate (সরল সুদ)</option>
                    <option value="REDUCING">Reducing Balance (হ্রাসমান জের)</option>
                  </select>
                </div>

                <Input
                  label="Duration (Tenure in Months)"
                  type="number"
                  value={durationMonths}
                  onChange={(e) => setDurationMonths(Number(e.target.value))}
                  required
                />
              </div>

              <div className={styles.row}>
                <div className={styles.field}>
                  <label className={styles.label}>Installment Frequency (কিস্তি সময়কাল)</label>
                  <select
                    className={styles.select}
                    value={frequency}
                    onChange={(e) =>
                      setFrequency(e.target.value as "DAILY" | "WEEKLY" | "MONTHLY")
                    }
                  >
                    <option value="MONTHLY">Monthly (মাসিক)</option>
                    <option value="WEEKLY">Weekly (সাপ্তাহিক)</option>
                    <option value="DAILY">Daily (দৈনিক)</option>
                  </select>
                </div>

                <Input
                  label="Total Number of Installments (কিস্তির সংখ্যা)"
                  type="number"
                  value={totalInstallments}
                  onChange={(e) => setTotalInstallments(Number(e.target.value))}
                  required
                />
              </div>

              <div className={styles.row}>
                <Input
                  label="Loan Purpose (ঋণের উদ্দেশ্য)"
                  value={loanPurpose}
                  onChange={(e) => setLoanPurpose(e.target.value)}
                />
                <Input
                  label="Start Date (বিতরণের তারিখ)"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={submitting || loadingCustomers || customers.length === 0}
                icon={<CheckCircle size={18} />}
              >
                {submitting ? "Saving to Database..." : "Approve & Issue Loan Contract"}
              </Button>
            </form>
          </Card>

          {/* Automated Calculation Summary Side Card */}
          <div className={styles.summarySidebar}>
            <Card title="Live Calculation Engine Result">
              <div className={styles.calcSummary}>
                <div className={styles.calcRow}>
                  <span>Principal Amount:</span>
                  <strong>৳{summary.principal.toLocaleString()}</strong>
                </div>
                <div className={styles.calcRow}>
                  <span>Total Calculated Interest:</span>
                  <strong>৳{summary.totalInterest.toLocaleString()}</strong>
                </div>
                <div className={`${styles.calcRow} ${styles.totalRow}`}>
                  <span>Total Payable:</span>
                  <span className={styles.highlightText}>
                    ৳{summary.totalPayable.toLocaleString()}
                  </span>
                </div>
                <div className={styles.calcRow}>
                  <span>Per Installment Amount:</span>
                  <span className={styles.installmentText}>
                    ৳{summary.installmentAmount.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className={styles.previewBox}>
                <h5>Schedule Preview ({previewSchedule.length} Installments)</h5>
                <div className={styles.previewList}>
                  {previewSchedule.slice(0, 4).map((s) => (
                    <div key={s.installmentNo} className={styles.previewItem}>
                      <span>
                        Inst #{s.installmentNo} ({s.dueDate.toISOString().split("T")[0]})
                      </span>
                      <strong>৳{s.totalDue}</strong>
                    </div>
                  ))}
                  {previewSchedule.length > 4 && (
                    <div className={styles.moreItems}>
                      + {previewSchedule.length - 4} more installments scheduled
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
