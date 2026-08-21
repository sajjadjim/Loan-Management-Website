"use client";

import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Table } from "@/components/ui/Table";
import { Search, RotateCcw } from "lucide-react";
import styles from "./transactions.module.css";

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");

  const fetchTransactionsFromDb = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/transactions?type=${encodeURIComponent(typeFilter)}`);
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setTransactions(json.data);
      }
    } catch (err) {
      console.error("Failed to load transactions from PostgreSQL database:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactionsFromDb();
  }, [typeFilter]);

  const filteredTxns = transactions.filter((t) => {
    const customerName = t.customer?.fullName || t.customerName || "";
    const memberCode = t.customer?.memberCode || t.memberCode || "";
    const txnCode = t.transactionCode || "";

    return (
      customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      memberCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      txnCode.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const handleVoidTransaction = async (id: string) => {
    if (
      confirm(
        "Are you sure you want to VOID/REVERSE this transaction? An audit reversal entry will be created."
      )
    ) {
      try {
        const res = await fetch("/api/transactions", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id }),
        });
        const json = await res.json();
        if (json.success) {
          alert("Transaction voided successfully.");
          fetchTransactionsFromDb();
        } else {
          alert(`Failed to void transaction: ${json.error}`);
        }
      } catch (err: any) {
        alert("Failed to connect to database: " + err.message);
      }
    }
  };

  return (
    <DashboardLayout title="Financial Transaction Register" userName="Admin User" userRole="ADMIN">
      <div className={styles.container}>
        <div className={styles.topBar}>
          <div className={styles.searchBox}>
            <Input
              placeholder="Search by transaction code, member name, code..."
              prefixIcon={<Search size={18} />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className={styles.typeSelect}
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="ALL">All Transaction Types</option>
            <option value="INSTALLMENT_PAYMENT">Installment Payment (কিস্তি)</option>
            <option value="LOAN_DISBURSEMENT">Loan Disbursement (ঋণ বিতরণ)</option>
            <option value="SAVINGS_DEPOSIT">Savings Deposit (সঞ্চয় জমা)</option>
            <option value="SAVINGS_WITHDRAWAL">Savings Withdrawal (সঞ্চয় উত্তোলন)</option>
          </select>
        </div>

        <Card title={`All Financial Transactions (${filteredTxns.length})`}>
          {loading ? (
            <div style={{ padding: "2rem", textAlign: "center", color: "var(--text-muted)" }}>
              Loading transactions from PostgreSQL database...
            </div>
          ) : (
            <Table<any>
              keyExtractor={(t: any) => t.id}
              data={filteredTxns}
              columns={[
                {
                  header: "Txn Code",
                  cell: (t: any) => <span className={styles.codeText}>{t.transactionCode}</span>,
                },
                {
                  header: "Date (তারিখ)",
                  cell: (t: any) =>
                    t.transactionDate
                      ? new Date(t.transactionDate).toISOString().split("T")[0]
                      : t.date || "N/A",
                },
                {
                  header: "Member",
                  cell: (t: any) => (
                    <div>
                      <strong>{t.customer?.fullName || t.customerName}</strong>
                      <div className={styles.subText}>{t.customer?.memberCode || t.memberCode}</div>
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
                  header: "Amount (টাকা)",
                  cell: (t: any) => (
                    <strong className="money-text">
                      ৳{Number(t.amount || 0).toLocaleString()}
                    </strong>
                  ),
                },
                { header: "Description", accessorKey: "description" },
                {
                  header: "Created By",
                  cell: (t: any) => t.user?.fullName || t.createdBy || "Admin User",
                },
                {
                  header: "Actions",
                  cell: (t: any) => (
                    <Button
                      variant="danger"
                      size="sm"
                      disabled={t.isVoided}
                      icon={<RotateCcw size={14} />}
                      onClick={() => handleVoidTransaction(t.id)}
                    >
                      {t.isVoided ? "Voided" : "Void"}
                    </Button>
                  ),
                },
              ]}
            />
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
