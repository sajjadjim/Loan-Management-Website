# 🏦 Loan & Samity Management System

A modern, full-stack **Loan & Microfinance Management Web Application** designed for cooperative societies (সমবায় সমিতি), microfinance institutions, and loan management organizations. Built with **Next.js 16 (App Router)**, **TypeScript**, **Prisma ORM**, and **PostgreSQL (Supabase)**.

---

## ✨ Features & Core Capabilities

### 📊 1. Executive Dashboard (`/dashboard`)
- **Real-Time Financial Overview**: Live database metrics displaying Total Members, Active Loans Count, Total Disbursed Amount, Total Collected Amount, Outstanding Loan Balance (স্থিতি), Overdue Balance, and Total Savings Vault.
- **Quick Action Hub**: Instant navigation to record daily collections or issue new loan contracts.
- **Recent Activity Feed**: Real-time listing of latest loan contracts and financial transactions.

### 👥 2. Member & Customer Management (`/customers` & `/customers/[id]`)
- **Member Registration**: Register new members with Member Code (`MEM-XXXX`), Full Name, Father/Husband Name, Phone Number, NID, Address, and Joining Date.
- **Automated Savings Vault**: Each registered member automatically gets an associated Savings Account in PostgreSQL.
- **Detailed Member Profile**: View individual member stats, loan history, dual-ledger transactions (সঞ্চয় ও ঋণ রেজিস্টার), and encrypted private documents.

### 📜 3. Loan Portfolio Management (`/loans`)
- **Loan Registry**: Search and filter loan contracts by loan code, member name, member code, or status (Active, Overdue, Completed, Pending).
- **Repayment Schedule Modal**: View full installment breakdown with due dates, principal breakdown, interest breakdown, and payment status.

### ✍️ 4. Issue New Loan Contract (`/loans/new`)
- **Dynamic Database Member Dropdown**: Select active members directly from the PostgreSQL database.
- **Financial Calculation Engine**: Supports both **Flat Rate (সরল সুদ)** and **Reducing Balance (হ্রাসমান জের)** interest calculation models.
- **Flexible Tenures & Frequencies**: Daily (দৈনিক), Weekly (সাপ্তাহিক), and Monthly (মাসিক) installment frequencies.
- **ACID Transaction Guarantee**: Single atomic transaction in PostgreSQL creates the loan contract, generates the complete installment schedule, logs the loan disbursement transaction, and writes an audit log.

### 📑 5. Digital Daily Collection Register (`/collections`)
- **Digital Notebook (ডিজিটাল আদায় খাতা)**: Record loan repayment collections and savings deposit/withdrawal entries simultaneously.
- **Live Sthiti Calculation**: Live preview of updated loan remaining balance and savings balance.
- **Printable Money Receipt**: Generates official money receipt (টাকা জমার রশিদ) with print functionality and member/collector signature fields.

### 💸 6. Financial Transaction Register (`/transactions`)
- **Audit Trail**: Complete log of all financial movements (Loan Disbursements, Installment Payments, Savings Deposits, Savings Withdrawals).
- **Transaction Voiding**: Reverses transactions with audit trail tracking.
- **Type & Search Filtering**: Filter by transaction type or search by transaction code/member name.

### 📈 7. Financial & Audit Reports (`/reports`)
- **Comprehensive Reports**: Daily Collection Report, Monthly Collection Report, Outstanding Loans Report, Overdue Loans Report, and Member Directory & Savings Report.
- **Date Range Filters**: Filter reports dynamically by custom start and end dates.
- **Print & Export**: Print reports directly or export filtered data into **CSV / Excel** format.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | [Next.js 16 (App Router)](https://nextjs.org/) with Turbopack |
| **Language** | [TypeScript](https://www.typescriptlang.org/) |
| **Database** | [PostgreSQL](https://www.postgresql.org/) (Supabase Compatible) |
| **ORM** | [Prisma ORM 7](https://www.prisma.io/) |
| **Validation** | [Zod](https://zod.dev/) |
| **UI & Styling** | Project-owned CSS Modules (`.module.css`) & CSS Design System Tokens |
| **Icons** | [Lucide React](https://lucide.dev/) |

---

## 📁 Directory Structure

```text
├── app/
│   ├── api/
│   │   ├── collections/     # ACID transaction for daily collections
│   │   ├── customers/       # Member CRUD endpoints
│   │   ├── dashboard/       # Dashboard metrics aggregation
│   │   ├── loans/           # Loan portfolio & contract creation
│   │   ├── reports/         # Dynamic financial report generation
│   │   └── transactions/    # Financial transaction ledger & voiding
│   ├── collections/         # Daily collection register page & receipt modal
│   ├── customers/           # Member directory & detailed profile page ([id])
│   ├── dashboard/           # Executive dashboard page
│   ├── loans/               # Loan portfolio list & issue new loan page (/new)
│   ├── reports/             # Financial & audit reports page
│   ├── transactions/        # Financial transaction register page
│   └── globals.css          # Core CSS design system & variables
├── components/
│   ├── layout/              # Sidebar, Header, DashboardLayout
│   └── ui/                  # Reusable Design System (Button, Card, Input, Table, Badge, Modal)
├── lib/
│   ├── db/                  # Prisma client instance
│   └── loan/                # Loan calculation engines & schedule generator
├── prisma/
│   └── schema.prisma        # PostgreSQL database schema & relationships
└── schemas/                 # Zod validation schemas
```

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 18.x or higher
- PostgreSQL Database (Local or Supabase)

### 2. Installation
Clone the repository and install dependencies:
```bash
git clone https://github.com/sajjadjim/Loan-Management-Website.git
cd Loan-Management-Website
npm install
```

### 3. Environment Setup
Create a `.env` file in the root directory and add your PostgreSQL connection URL:
```env
DATABASE_URL="postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres?schema=public"
```

### 4. Database Setup & Migration
Run Prisma migrations to generate database tables:
```bash
npx prisma db push
# or
npx prisma migrate dev --name init
```

Generate Prisma Client:
```bash
npx prisma generate
```

### 5. Running the Application
Start the local development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Production Verification & Build

To verify type safety and build the production bundle:
```bash
# Type checking
npx tsc --noEmit

# Production build
npm run build

# Start production server
npm run start
```

---

## 📝 License
This project is proprietary software developed for Samity & Loan Management Operations.
