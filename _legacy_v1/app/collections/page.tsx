"use client";

import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Receipt, Printer, CheckCircle2 } from "lucide-react";
import styles from "./collections.module.css";

export default function CollectionsPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");
  const [paymentDate, setPaymentDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );

  // Form entries
  const [installmentNo, setInstallmentNo] = useState<number>(1);
  const [loanCollectionAmount, setLoanCollectionAmount] = useState<number | "">(0);
  const [savingsDeposit, setSavingsDeposit] = useState<number | "">(0);
  const [savingsWithdrawal, setSavingsWithdrawal] = useState<number | "">(0);
  const [referenceNo, setReferenceNo] = useState<string>(`REC-${Date.now().toString().slice(-4)}`);
  const [collectorNote, setCollectorNote] = useState<string>("নিয়মিত কিস্তি আদায়");
  const [submitting, setSubmitting] = useState(false);

  // Receipt Modal state
  const [receiptData, setReceiptData] = useState<any | null>(null);

  useEffect(() => {
    fetch("/api/customers")
      .then((res) => res.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          setCustomers(json.data);
          setSelectedCustomerId(json.data[0].id);
        }
      })
      .catch((err) => console.error("Error loading customers:", err));
  }, []);

  const currentCustomer = customers.find((c) => c.id === selectedCustomerId) || customers[0];
  const activeLoan = currentCustomer?.loans?.find((l: any) => l.status === "ACTIVE") || currentCustomer?.loans?.[0];

  const currentLoanBalance = activeLoan ? Number(activeLoan.remainingAmount) : 0;
  const currentSavingsBalance = currentCustomer?.savingsAccount ? Number(currentCustomer.savingsAccount.currentBalance) : 0;

  const numLoanCollection = Number(loanCollectionAmount || 0);
  const numSavingsDeposit = Number(savingsDeposit || 0);
  const numSavingsWithdrawal = Number(savingsWithdrawal || 0);

  const newLoanBalance = Math.max(0, currentLoanBalance - numLoanCollection);
  const newSavingsBalance = Math.max(0, currentSavingsBalance + numSavingsDeposit - numSavingsWithdrawal);

  const handleProcessCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: selectedCustomerId,
          loanId: activeLoan?.id,
          paymentDate,
          loanPaymentAmount: numLoanCollection,
          savingsDepositAmount: numSavingsDeposit,
          savingsWithdrawalAmount: numSavingsWithdrawal,
          referenceNo,
          note: collectorNote,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setReceiptData({
          receiptNo: json.data.receiptNo || referenceNo,
          date: paymentDate,
          customerName: currentCustomer.fullName,
          memberCode: currentCustomer.memberCode,
          loanCode: activeLoan?.loanCode || "N/A",
          installmentNo,
          loanCollectionAmount: numLoanCollection,
          previousLoanBalance: currentLoanBalance,
          newLoanBalance,
          savingsDeposit: numSavingsDeposit,
          savingsWithdrawal: numSavingsWithdrawal,
          previousSavingsBalance: currentSavingsBalance,
          newSavingsBalance,
          referenceNo,
          note: collectorNote,
          collector: "Admin User",
        });

        // Refresh customers state from database
        const resCust = await fetch("/api/customers");
        const jsonCust = await resCust.json();
        if (jsonCust.success) setCustomers(jsonCust.data);
      } else {
        alert(`Error: ${json.error}`);
      }
    } catch (err: any) {
      alert("Failed to connect to database: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout
      title="Daily Collection Register (PostgreSQL Live)"
      userName="Admin User"
      userRole="ADMIN"
    >
      <div className={styles.container}>
        <div className={styles.notebookHeaderBanner}>
          <div className={styles.bannerInfo}>
            <h3>ডিজিটাল আদায় খাতা (Supabase Database Synced)</h3>
            <p>Paper notebook equivalent entry recorded directly into Supabase PostgreSQL.</p>
          </div>
          <Badge status="active" label="Live PostgreSQL ACID Transaction" />
        </div>

        <div className={styles.layoutGrid}>
          <Card title="Record Collection Entry (আদায়ী এন্ট্রি)">
            <form onSubmit={handleProcessCollection} className={styles.form}>
              <div className={styles.field}>
                <label className={styles.label}>1. Select Member (সদস্য নির্বাচন)</label>
                <select
                  className={styles.select}
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.fullName} ({c.memberCode}) - {c.phone}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.row}>
                <Input
                  label="Collection Date (তারিখ)"
                  type="date"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  required
                />
                <Input
                  label="Receipt / Reference No"
                  value={referenceNo}
                  onChange={(e) => setReferenceNo(e.target.value)}
                />
              </div>

              <div className={styles.dualSection}>
                <div className={styles.accountBox}>
                  <h4 className={styles.boxTitle}>
                    ঋণের হিসাব (Loan Repayment Account)
                  </h4>
                  {activeLoan ? (
                    <>
                      <div className={styles.balanceInfo}>
                        <span>Active Loan: <strong>{activeLoan.loanCode}</strong></span>
                        <span>Current Sthiti (স্থিতি): <strong>৳{currentLoanBalance.toLocaleString()}</strong></span>
                      </div>
                      <div className={styles.row}>
                        <Input
                          label="Installment No (কিস্তি নং)"
                          type="number"
                          value={installmentNo}
                          onChange={(e) => setInstallmentNo(Number(e.target.value))}
                        />
                        <Input
                          label="Loan Collection (আদায় ৳)"
                          type="number"
                          placeholder="0"
                          value={loanCollectionAmount}
                          onChange={(e) =>
                            setLoanCollectionAmount(
                              e.target.value === "" ? "" : Number(e.target.value)
                            )
                          }
                        />
                      </div>
                    </>
                  ) : (
                    <div className={styles.noLoanAlert}>
                      No active loan found for this member in database.
                    </div>
                  )}
                </div>

                <div className={styles.accountBox}>
                  <h4 className={styles.boxTitle}>
                    সঞ্চয়ের বিবরণ (Savings Account Details)
                  </h4>
                  <div className={styles.balanceInfo}>
                    <span>Current Savings Balance:</span>
                    <strong>৳{currentSavingsBalance.toLocaleString()}</strong>
                  </div>
                  <div className={styles.row}>
                    <Input
                      label="Savings Deposit (জমা ৳)"
                      type="number"
                      placeholder="0"
                      value={savingsDeposit}
                      onChange={(e) =>
                        setSavingsDeposit(
                          e.target.value === "" ? "" : Number(e.target.value)
                        )
                      }
                    />
                    <Input
                      label="Savings Withdrawal (উত্তোলন ৳)"
                      type="number"
                      placeholder="0"
                      value={savingsWithdrawal}
                      onChange={(e) =>
                        setSavingsWithdrawal(
                          e.target.value === "" ? "" : Number(e.target.value)
                        )
                      }
                    />
                  </div>
                </div>
              </div>

              <Input
                label="Collector Note / Description"
                value={collectorNote}
                onChange={(e) => setCollectorNote(e.target.value)}
              />

              <Button
                type="submit"
                variant="success"
                size="lg"
                disabled={submitting}
                icon={<CheckCircle2 size={18} />}
              >
                {submitting ? "Saving to Supabase PostgreSQL..." : "Confirm Payment & Save to Database"}
              </Button>
            </form>
          </Card>

          <div className={styles.sidebar}>
            <Card title="Live Balance Preview (হিসাব স্থিতি)">
              <div className={styles.previewGroup}>
                <h5>Loan Account (ঋণের স্থিতি)</h5>
                <div className={styles.calcRow}>
                  <span>Current Outstanding:</span>
                  <span>৳{currentLoanBalance.toLocaleString()}</span>
                </div>
                <div className={styles.calcRow}>
                  <span>Collection Amount:</span>
                  <span className={styles.minusText}>- ৳{loanCollectionAmount.toLocaleString()}</span>
                </div>
                <div className={`${styles.calcRow} ${styles.resultRow}`}>
                  <span>New Loan Sthiti (নতুন স্থিতি):</span>
                  <strong className={styles.newLoanText}>৳{newLoanBalance.toLocaleString()}</strong>
                </div>
              </div>

              <div className={styles.previewGroup}>
                <h5>Savings Vault (সঞ্চয় মোট)</h5>
                <div className={styles.calcRow}>
                  <span>Current Savings Balance:</span>
                  <span>৳{currentSavingsBalance.toLocaleString()}</span>
                </div>
                <div className={styles.calcRow}>
                  <span>Deposit Amount:</span>
                  <span className={styles.plusText}>+ ৳{savingsDeposit.toLocaleString()}</span>
                </div>
                <div className={styles.calcRow}>
                  <span>Withdrawal Amount:</span>
                  <span className={styles.minusText}>- ৳{savingsWithdrawal.toLocaleString()}</span>
                </div>
                <div className={`${styles.calcRow} ${styles.resultRow}`}>
                  <span>New Savings Total:</span>
                  <strong className={styles.newSavingsText}>৳{newSavingsBalance.toLocaleString()}</strong>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {receiptData && (
          <Modal
            isOpen={!!receiptData}
            onClose={() => setReceiptData(null)}
            title="Money Receipt (টাকা জমার রশিদ)"
            footer={
              <>
                <Button variant="secondary" onClick={() => setReceiptData(null)}>
                  Close
                </Button>
                <Button
                  variant="primary"
                  icon={<Printer size={16} />}
                  onClick={() => window.print()}
                >
                  Print Receipt
                </Button>
              </>
            }
          >
            <div className={styles.receiptContainer}>
              <div className={styles.receiptHeader}>
                <h3>SAMITY LOAN & SAVINGS MANAGEMENT</h3>
                <p>Official Collection Receipt (Database Recorded)</p>
                <div className={styles.receiptMeta}>
                  <span>Receipt No: <strong>{receiptData.receiptNo}</strong></span>
                  <span>Date: {receiptData.date}</span>
                </div>
              </div>

              <div className={styles.receiptDetails}>
                <div className={styles.rRow}>
                  <span>Member Name:</span>
                  <strong>{receiptData.customerName}</strong>
                </div>
                <div className={styles.rRow}>
                  <span>Member Code:</span>
                  <strong>{receiptData.memberCode}</strong>
                </div>
                <div className={styles.rRow}>
                  <span>Loan Account Code:</span>
                  <strong>{receiptData.loanCode}</strong>
                </div>
                <div className={styles.rRow}>
                  <span>Installment No:</span>
                  <strong>#{receiptData.installmentNo}</strong>
                </div>
              </div>

              <table className={styles.receiptTable}>
                <thead>
                  <tr>
                    <th>Account Type</th>
                    <th>Collected Amount</th>
                    <th>Updated Balance</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Loan Repayment (আদায়)</td>
                    <td>৳{receiptData.loanCollectionAmount.toLocaleString()}</td>
                    <td>৳{receiptData.newLoanBalance.toLocaleString()} (Sthiti)</td>
                  </tr>
                  <tr>
                    <td>Savings Deposit (জমা)</td>
                    <td>৳{receiptData.savingsDeposit.toLocaleString()}</td>
                    <td>৳{receiptData.newSavingsBalance.toLocaleString()} (Total)</td>
                  </tr>
                </tbody>
              </table>

              <div className={styles.receiptSignatures}>
                <div>
                  <span className={styles.signLine} />
                  <span>Member Signature</span>
                </div>
                <div>
                  <span className={styles.signLine} />
                  <span>Collector Signature ({receiptData.collector})</span>
                </div>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </DashboardLayout>
  );
}
