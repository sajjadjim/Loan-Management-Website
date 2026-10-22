# 🏦 Simple Loan Management System (ঋণ ও সঞ্চয় ব্যবস্থাপনা সিস্টেম)

A modern, high-performance, and feature-rich **Microfinance & Loan Management Web Application** built with **Next.js 16 (App Router)**, **TypeScript**, **Supabase PostgreSQL**, and **Google Drive Automated Document Storage**.

Designed for non-profit organizations, samity (সমিতি), and micro-credit loan management to track member deposits, savings withdrawals, loan repayments, ledger passbooks, NID documents, and guarantor details with ease.

---

## 🌟 Key Features

### 👥 1. Comprehensive Member Management
- **Automatic Member & Book Numbering**: Seamless auto-incrementing member and passbook numbers.
- **Complete Profile & Guarantor Tracking**: Store detailed member address, mobile number, NID number, guarantor details, and guarantor NID.
- **Webcam & Device Uploads**: Live photo capture directly from laptop/mobile cameras or device file picker with automatic browser-side image compression.

### 📁 2. Automated Google Drive Document Storage (Database Saver)
- **Zero Database Storage Bloat**: Solves Supabase's free tier 500MB limit by delegating all member photos and NID card images to Google Drive.
- **Per-Member Folder Automation**: Automatically creates a dedicated Google Drive folder (e.g. `Member_125_Anowar_Hosain`) for each member upon registration.
- **Direct Drive Passbook Access**: Access the member's full Google Drive folder directly from their digital passbook with one click.

### 📊 3. Passbook & Financial Ledger System
- **Real-Time Ledger Calculations**: Calculates running total savings, loan balance, remaining dues, and repayment progress automatically.
- **Printable Passbook View**: Clean, professional print-ready passbook layout formatted for paper records.
- **Dual Language UI (বাংলা / English)**: Switch instantly between Bengali and English interfaces.

### ⚡ 4. High Availability & Database Redundancy
- **Dual Supabase Sync**: Supports Primary and Secondary (Backup) Supabase databases for fail-safe data storage.
- **Local Fallback Mode**: Functions offline with browser LocalStorage backup if database connection is temporarily interrupted.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | [Next.js 16 (App Router)](https://nextjs.org/) |
| **Language** | [TypeScript](https://www.typescriptlang.org/) |
| **Database** | [Supabase PostgreSQL](https://supabase.com/) |
| **Cloud Storage** | [Google Drive API](https://www.google.com/drive/) / [Google Apps Script](https://script.google.com/) |
| **Styling** | Vanilla CSS Modules & Glassmorphism UI |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **Deployment** | Netlify / Vercel |

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js `v18+` or `v20+`
- `npm` or `yarn`

### 1. Clone & Install Dependencies
```bash
cd "simple Loan Management"
npm install
```

### 2. Configure Environment Variables
Create a `.env.local` file in the root directory:

```env
# Supabase Primary Database
NEXT_PUBLIC_SUPABASE_URL=https://your-primary-supabase-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-primary-supabase-anon-key

# Optional: Supabase Secondary Database (Backup Sync)
NEXT_PUBLIC_SUPABASE_URL_SECONDARY=https://your-secondary-supabase-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY_SECONDARY=your-secondary-supabase-anon-key

# Google Drive Storage Integration (Choose Option A or Option B)
# Option A: Google Apps Script Web App URL
NEXT_PUBLIC_GOOGLE_SCRIPT_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec

# Option B: Google Cloud Service Account (Alternative)
GOOGLE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_DRIVE_FOLDER_ID=1NnSLLkd-plY13jynoj2O2Z-J7itnoE1V
```

### 3. Setup Database Schema (Supabase)
Run the SQL script located in [`supabase/schema.sql`](supabase/schema.sql) in your Supabase SQL Editor.

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Run schema.sql script to create members and transactions tables
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## ☁️ Google Drive Integration Setup (2 Minutes)

To automatically store member photos & NID images on Google Drive:

1. Go to **[script.google.com](https://script.google.com)** and create a **New project**.
2. Copy all code from [`google-apps-script.js`](google-apps-script.js) and paste it into the editor (`Code.gs`).
3. Click **Deploy** -> **New deployment** -> Select **Web app**.
   - **Execute as**: `Me`
   - **Who has access**: `Anyone`
4. Copy the Web App URL and set it as `NEXT_PUBLIC_GOOGLE_SCRIPT_URL` in `.env.local`.

---

## 📂 Project Structure

```
├── google-apps-script.js       # Google Apps Script code for Drive integration
├── supabase/
│   └── schema.sql              # Supabase PostgreSQL database tables & policies
├── src/
│   ├── app/                    # Next.js App Router pages and API routes
│   │   ├── api/upload-drive/   # Serverless Google Drive upload endpoint
│   │   ├── members/[id]/       # Member Passbook & Ledger page
│   │   ├── layout.tsx
│   │   └── page.tsx            # Main Dashboard & Member list
│   ├── components/             # Reusable UI Components
│   │   ├── MemberFormModal.tsx # Member creation & edit modal with GDrive upload
│   │   ├── PassbookHeader.tsx  # Member summary card with Drive folder button
│   │   ├── LedgerTable.tsx     # Transaction ledger table
│   │   ├── CameraCaptureModal.tsx # Live webcam camera modal
│   │   └── ...
│   ├── lib/                    # Utilities & Database client
│   │   ├── db.ts               # Supabase CRUD operations & local sync
│   │   ├── googleDrive.ts      # Google Drive upload orchestrator
│   │   ├── imageCompressor.ts  # Client-side image compression
│   │   ├── supabaseClient.ts   # Dual Supabase client configuration
│   │   └── types.ts            # TypeScript interfaces
└── public/
```

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.

