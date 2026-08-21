"use client";

import React, { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Table } from "@/components/ui/Table";
import { Search, History, RotateCcw, AlertOctagon } from "lucide-react";
import { INITIAL_TRANSACTIONS, MockTransaction } from "@/lib/data/mockData";
import styles from "./transactions.module.css";

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<MockTransaction[]>(INITIAL_TRANSACTIONS);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");

  const filteredTxns = transactions.filter((t) => {
    const matchesSearch =
      t.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.memberCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.transactionCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "ALL" || t.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const handleVoidTransaction = (id: string) => {
    if (confirm("Are you sure you want to VOID/REVERSE this transaction? An audit reversal entry will be created.")) {
      setTransactions((prev) =>
        prev.map((t) => (t.id === id ? { ...t, description: `[VOIDED/REVERSED] ${t.description}` } : t))
      );
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
          <Table
            keyExtractor={(t) => t.id}
            data={filteredTxns}
            columns={[
              {
                header: "Txn Code",
                cell: (t) => <span className={styles.codeText}>{t.transactionCode}</span>,
              },
              { header: "Date (তারিখ)", accessorKey: "date" },
              {
                header: "Member",
                cell: (t) => (
                  <div>
                    <strong>{t.customerName}</strong>
                    <div className={styles.subText}>{t.memberCode}</div>
                  </div>
                ),
              },
              {
                header: "Type",
                cell: (t) => (
                  <Badge
                    status={
                      t.type === "INSTALLMENT_PAYMENT"
                        ? "paid"
                        : t.type === "LOAN_DISBURSEMENT"
                        ? "info"
                        : "active"
                    }
                    label={t.type.replace(/_/g, " ")}
                  />
                ),
              },
              {
                header: "Amount (টাকা)",
                cell: (t) => <strong className="money-text">৳{t.amount.toLocaleString()}</strong>,
              },
              { header: "Description", accessorKey: "description" },
              { header: "Created By", accessorKey: "createdBy" },
              {
                header: "Actions",
                cell: (t) => (
                  <Button
                    variant="danger"
                    size="sm"
                    icon={<RotateCcw size={14} />}
                    onClick={() => handleVoidTransaction(t.id)}
                  >
                    Void
                  </Button>
                ),
              },
            ]}
          />
        </Card>
      </div>
    </DashboardLayout>
  );
}
