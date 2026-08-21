# Business Rules Specification - Loan / Member Management System

## Overview
This document contains the authoritative business logic and calculation rules for the Loan / Member Management System.
As specified in **Section 27 (Important AI Development Rule)**, financial rules are strictly categorized into **CONFIRMED** and **REQUIRES CLIENT CONFIRMATION**.

---

## 1. Member / Customer Management
- **[CONFIRMED]** Each customer has a unique Member ID (e.g., `MEM-0128`).
- **[CONFIRMED]** Minimal customer records: Full Name, Father's/Husband's Name (optional), Mobile, Address, NID, Joining Date, Status.
- **[CONFIRMED]** Member documents (NID photo, customer security photo) must be stored in secure private storage / Google Drive, storing only metadata/file ID in PostgreSQL.

---

## 2. Loan Management & Installments
- **[CONFIRMED]** Loans track: Amount, Interest Rate, Interest Type, Loan Purpose, Start Date, Duration, Installment Frequency, Number of Installments, Installment Amount, Total Payable, Paid Amount, Remaining Balance (*Sthiti*), and Status.
- **[CONFIRMED]** Financial calculations must use PostgreSQL `NUMERIC` / `DECIMAL` types.
- **[CONFIRMED]** Dedicated calculation engine strictly isolated in `/lib/loan/`:
  - `calculateInterest.ts`
  - `calculateInstallment.ts`
  - `calculateRemaining.ts`
  - `calculateLateFee.ts`
  - `loanSummary.ts`
- **[REQUIRES CLIENT CONFIRMATION]** Is interest included directly inside the "ঋণের পরিমাণ" specified in ledger sheets, or is interest calculated dynamically as a flat rate vs. reducing balance percentage?
- **[REQUIRES CLIENT CONFIRMATION]** What is the exact installment collection frequency (Daily, Weekly, Monthly)?
- **[REQUIRES CLIENT CONFIRMATION]** Are late fees or penalties assessed for missed installment dates?

---

## 3. Savings Account & Dual-Ledger Operations
- **[CONFIRMED]** The ledger tracks both Savings (Deposit, Withdrawal, Total Savings) and Loan Account (Installment No, Collection, Remaining *Sthiti*) on each date entry.
- **[REQUIRES CLIENT CONFIRMATION]** Is a mandatory savings deposit required when opening a loan or paying an installment?
- **[REQUIRES CLIENT CONFIRMATION]** Does savings earn interest for the member?
- **[REQUIRES CLIENT CONFIRMATION]** Can a member withdraw savings while an active loan is outstanding?

---

## 4. Financial Transactions & Audit Trail
- **[CONFIRMED]** Every financial operation creates an immutable transaction record (Disbursement, Payment, Deposit, Withdrawal, Adjustment, Reversal).
- **[CONFIRMED]** Historical financial records are NEVER physically deleted or silently modified. Reversals create explicit correction transactions.
- **[CONFIRMED]** All financial updates must run inside database transactions (`BEGIN`, `COMMIT`, `ROLLBACK`).
- **[CONFIRMED]** Every action creates an audit log entry (User, Action, Entity, Entity ID, Old Value, New Value, IP Address, Timestamp).

---

## 5. System Roles & Access Controls
- **[CONFIRMED]** `ADMIN`: Full system access, user management, loan creation, payment entry, audit logs, financial void/corrections.
- **[CONFIRMED]** `STAFF`: Customer management, payment entry, view reports. Cannot manage admin accounts or void financial transactions.
- **[CONFIRMED]** `VIEWER`: Read-only access across system views.
