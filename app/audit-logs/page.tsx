"use client";

import React, { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Table } from "@/components/ui/Table";
import { Search, ShieldCheck, User, Terminal } from "lucide-react";
import styles from "./auditLogs.module.css";

export interface MockAuditEntry {
  id: string;
  timestamp: string;
  user: string;
  role: string;
  action: string;
  entityName: string;
  entityId: string;
  ipAddress: string;
  oldValue: string;
  newValue: string;
}

const INITIAL_AUDIT_LOGS: MockAuditEntry[] = [
  {
    id: "aud-001",
    timestamp: "2024-08-21 11:30:15",
    user: "Admin User (admin@samity.com)",
    role: "ADMIN",
    action: "INSTALLMENT_PAYMENT_CREATE",
    entityName: "LoanInstallment",
    entityId: "inst-0128-02",
    ipAddress: "192.168.1.45",
    oldValue: "remainingAmount: 75000",
    newValue: "remainingAmount: 50000, paidAmount: 25000",
  },
  {
    id: "aud-002",
    timestamp: "2024-08-21 10:15:00",
    user: "Admin User (admin@samity.com)",
    role: "ADMIN",
    action: "CUSTOMER_REGISTER",
    entityName: "Customer",
    entityId: "cust-0128",
    ipAddress: "192.168.1.45",
    oldValue: "NULL",
    newValue: "memberCode: MEM-0128, name: ইমরান হোসেন (রনি)",
  },
  {
    id: "aud-003",
    timestamp: "2024-08-20 16:45:22",
    user: "Staff User (staff@samity.com)",
    role: "STAFF",
    action: "SAVINGS_DEPOSIT",
    entityName: "SavingsAccount",
    entityId: "sav-0128",
    ipAddress: "192.168.1.88",
    oldValue: "currentBalance: 4500",
    newValue: "currentBalance: 5000",
  },
];

export default function AuditLogsPage() {
  const [logs] = useState<MockAuditEntry[]>(INITIAL_AUDIT_LOGS);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredLogs = logs.filter(
    (l) =>
      l.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.entityId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout title="System Audit Trail & Security Logs" userName="Admin User" userRole="ADMIN">
      <div className={styles.container}>
        <div className={styles.topBar}>
          <div className={styles.searchBox}>
            <Input
              placeholder="Search audit trail by user, action, or record ID..."
              prefixIcon={<Search size={18} />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <Card title={`Immutable Security Audit Trail (${filteredLogs.length} Events)`}>
          <Table
            keyExtractor={(l) => l.id}
            data={filteredLogs}
            columns={[
              { header: "Timestamp", accessorKey: "timestamp" },
              {
                header: "User / Role",
                cell: (l) => (
                  <div>
                    <strong>{l.user}</strong>
                    <div>
                      <Badge status="info" label={l.role} showDot={false} />
                    </div>
                  </div>
                ),
              },
              {
                header: "Action",
                cell: (l) => <Badge status="active" label={l.action} />,
              },
              { header: "Affected Entity", cell: (l) => `${l.entityName} (${l.entityId})` },
              { header: "IP Address", accessorKey: "ipAddress" },
              {
                header: "Changes (Before → After)",
                cell: (l) => (
                  <div className={styles.diffBox}>
                    <div className={styles.oldVal}>- {l.oldValue}</div>
                    <div className={styles.newVal}>+ {l.newValue}</div>
                  </div>
                ),
              },
            ]}
          />
        </Card>
      </div>
    </DashboardLayout>
  );
}
