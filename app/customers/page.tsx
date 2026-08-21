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
import { Search, UserPlus, Eye, Phone, RefreshCw } from "lucide-react";
import { MockCustomer } from "@/lib/data/mockData";
import styles from "./customers.module.css";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<MockCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // New Customer Form State
  const [formData, setFormData] = useState({
    memberCode: `MEM-${Math.floor(1000 + Math.random() * 9000)}`,
    fullName: "",
    fatherHusbandName: "",
    phone: "",
    address: "",
    nidNumber: "",
    joiningDate: new Date().toISOString().split("T")[0],
    notes: "",
  });

  const fetchCustomersFromDb = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/customers?query=${encodeURIComponent(searchTerm)}`);
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        const mapped = json.data.map((c: any) => ({
          id: c.id,
          memberCode: c.memberCode,
          fullName: c.fullName,
          fatherHusbandName: c.fatherHusbandName || "",
          phone: c.phone,
          address: c.address || "",
          nidNumber: c.nidNumber || "",
          joiningDate: new Date(c.joiningDate).toISOString().split("T")[0],
          status: c.status,
          savingsBalance: Number(c.savingsAccount?.currentBalance || 0),
        }));
        setCustomers(mapped);
      }
    } catch (err) {
      console.error("Failed to load customers from Supabase PostgreSQL:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomersFromDb();
  }, [searchTerm]);

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.phone) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      if (json.success) {
        alert("Member successfully registered and saved to Supabase PostgreSQL database!");
        setIsModalOpen(false);
        setFormData({
          memberCode: `MEM-${Math.floor(1000 + Math.random() * 9000)}`,
          fullName: "",
          fatherHusbandName: "",
          phone: "",
          address: "",
          nidNumber: "",
          joiningDate: new Date().toISOString().split("T")[0],
          notes: "",
        });
        fetchCustomersFromDb();
      } else {
        alert(`Error: ${json.error}`);
      }
    } catch (err: any) {
      alert("Failed to connect to server: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout title="Members / Customer Directory" userName="Admin User" userRole="ADMIN">
      <div className={styles.container}>
        <div className={styles.topBar}>
          <div className={styles.searchBox}>
            <Input
              placeholder="Search Supabase database by name, code, phone..."
              prefixIcon={<Search size={18} />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button
            variant="primary"
            icon={<UserPlus size={18} />}
            onClick={() => setIsModalOpen(true)}
          >
            Add New Member (নতুন সদস্য)
          </Button>
        </div>

        <Card title={`Live Supabase PostgreSQL Members (${customers.length})`}>
          {loading ? (
            <div style={{ padding: "2rem", textAlign: "center", color: "var(--text-muted)" }}>
              Loading member records from PostgreSQL database...
            </div>
          ) : (
            <Table
              keyExtractor={(c) => c.id}
              data={customers}
              columns={[
                {
                  header: "Member Code",
                  cell: (c) => <span className={styles.codeText}>{c.memberCode}</span>,
                },
                {
                  header: "Full Name (সদস্যের নাম)",
                  cell: (c) => (
                    <div className={styles.nameCell}>
                      <div className={styles.avatar}>{c.fullName.charAt(0)}</div>
                      <div>
                        <strong className={styles.nameText}>{c.fullName}</strong>
                        {c.fatherHusbandName && (
                          <div className={styles.subText}>পিতা/স্বামী: {c.fatherHusbandName}</div>
                        )}
                      </div>
                    </div>
                  ),
                },
                {
                  header: "Mobile Number",
                  cell: (c) => (
                    <span className={styles.phoneText}>
                      <Phone size={14} className={styles.inlineIcon} /> {c.phone}
                    </span>
                  ),
                },
                { header: "Address", accessorKey: "address" },
                {
                  header: "Savings Vault",
                  cell: (c) => (
                    <span className="money-text">৳{c.savingsBalance.toLocaleString()}</span>
                  ),
                },
                {
                  header: "Joining Date",
                  accessorKey: "joiningDate",
                },
                {
                  header: "Status",
                  cell: (c) => <Badge status={c.status} />,
                },
                {
                  header: "Actions",
                  cell: (c) => (
                    <div className={styles.actionCell}>
                      <Link href={`/customers/${c.id}`}>
                        <Button variant="secondary" size="sm" icon={<Eye size={14} />}>
                          Profile
                        </Button>
                      </Link>
                    </div>
                  ),
                },
              ]}
            />
          )}
        </Card>

        {/* Add Customer Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Register New Samity Member (Supabase Save)"
        >
          <form onSubmit={handleCreateCustomer} className={styles.modalForm}>
            <Input
              label="Member ID Code (সদস্য নম্বর)"
              value={formData.memberCode}
              onChange={(e) => setFormData({ ...formData, memberCode: e.target.value })}
              required
            />
            <Input
              label="Member Full Name (সদস্যের নাম)"
              placeholder="e.g. ইমরান হোসেন"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              required
            />
            <Input
              label="Father / Husband Name (পিতা / স্বামীর নাম)"
              placeholder="e.g. নুরুল ইসলাম"
              value={formData.fatherHusbandName}
              onChange={(e) => setFormData({ ...formData, fatherHusbandName: e.target.value })}
            />
            <Input
              label="Mobile Number (মোবাইল নম্বর)"
              placeholder="018XXXXXXXX"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
            />
            <Input
              label="National ID (NID) Number"
              placeholder="1994XXXXXX"
              value={formData.nidNumber}
              onChange={(e) => setFormData({ ...formData, nidNumber: e.target.value })}
            />
            <Input
              label="Address (ঠিকানা)"
              placeholder="মিরপুর, ঢাকা"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
            <Input
              label="Joining Date (ভর্তির তারিখ)"
              type="date"
              value={formData.joiningDate}
              onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
            />

            <div className={styles.modalFooter}>
              <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={submitting}>
                {submitting ? "Saving to PostgreSQL..." : "Save Member to Supabase"}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
