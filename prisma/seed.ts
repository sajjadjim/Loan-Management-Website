import "dotenv/config";
import { PrismaClient, Role, CustomerStatus, LoanStatus, InterestType, InstallmentFrequency, TransactionType } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import bcrypt from "bcryptjs";

// Use DIRECT_URL for direct seeding connection
const connectionString =
  process.env.DIRECT_URL || process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/loan_management_db?schema=public";

const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Starting PostgreSQL database seeding via DIRECT_URL...");

  // 1. Create Default Admin & Staff Users
  const adminPasswordHash = await bcrypt.hash("admin123456", 10);
  const staffPasswordHash = await bcrypt.hash("staff123456", 10);

  const adminUser = await prisma.user.upsert({
    where: { email: "admin@samity.com" },
    update: {},
    create: {
      email: "admin@samity.com",
      fullName: "System Administrator",
      passwordHash: adminPasswordHash,
      role: Role.ADMIN,
    },
  });

  const staffUser = await prisma.user.upsert({
    where: { email: "staff@samity.com" },
    update: {},
    create: {
      email: "staff@samity.com",
      fullName: "Field Staff User",
      passwordHash: staffPasswordHash,
      role: Role.STAFF,
    },
  });

  console.log("Seeded Users: Admin & Staff");

  // 2. Create Initial Customer (Imran Hossain / Roni - MEM-0128 from Notebook)
  const customer1 = await prisma.customer.upsert({
    where: { memberCode: "MEM-0128" },
    update: {},
    create: {
      memberCode: "MEM-0128",
      fullName: "ইমরান হোসেন (রনি)",
      fatherHusbandName: "নুরুল ইসলাম",
      phone: "01872424926",
      address: "মিরপুর-১০, ঢাকা",
      nidNumber: "1994269123456",
      joiningDate: new Date("2024-05-10"),
      status: CustomerStatus.ACTIVE,
      notes: "দোকান বিস্তার উদ্দেশ্যে ১০/৫/২৪ তারিখে ১০০০০০ টাকা ঋণ অনুমোদন।",
      savingsAccount: {
        create: {
          currentBalance: 5000,
          totalDeposited: 10000,
          totalWithdrawn: 5000,
        },
      },
    },
  });

  console.log(`Seeded Member: ${customer1.fullName} (${customer1.memberCode})`);

  // 3. Create Loan for MEM-0128
  const loan1 = await prisma.loan.upsert({
    where: { loanCode: "LN-2024-0128" },
    update: {},
    create: {
      customerId: customer1.id,
      loanCode: "LN-2024-0128",
      loanAmount: 100000,
      interestRate: 10,
      interestType: InterestType.FLAT,
      loanPurpose: "দোকান বিস্তার",
      startDate: new Date("2024-05-10"),
      durationMonths: 5,
      frequency: InstallmentFrequency.MONTHLY,
      totalInstallments: 5,
      installmentAmount: 22000,
      totalPayable: 110000,
      totalInterest: 10000,
      paidAmount: 50000,
      remainingAmount: 60000,
      status: LoanStatus.ACTIVE,
      installments: {
        create: [
          {
            installmentNo: 1,
            dueDate: new Date("2024-06-10"),
            principalAmount: 20000,
            interestAmount: 2000,
            totalDue: 22000,
            paidAmount: 25000,
            remainingAmount: 0,
            status: "PAID",
            paidDate: new Date("2024-06-10"),
          },
          {
            installmentNo: 2,
            dueDate: new Date("2024-07-10"),
            principalAmount: 20000,
            interestAmount: 2000,
            totalDue: 22000,
            paidAmount: 25000,
            remainingAmount: 0,
            status: "PAID",
            paidDate: new Date("2024-07-10"),
          },
          {
            installmentNo: 3,
            dueDate: new Date("2024-08-10"),
            principalAmount: 20000,
            interestAmount: 2000,
            totalDue: 22000,
            paidAmount: 0,
            remainingAmount: 22000,
            status: "PENDING",
          },
        ],
      },
    },
  });

  console.log(`Seeded Loan: ${loan1.loanCode}`);

  // 4. Create Initial Transactions
  await prisma.transaction.createMany({
    skipDuplicates: true,
    data: [
      {
        transactionCode: "TXN-2024-1001",
        customerId: customer1.id,
        loanId: loan1.id,
        transactionDate: new Date("2024-05-10"),
        type: TransactionType.LOAN_DISBURSEMENT,
        amount: 100000,
        description: "ঋণ প্রদান - দোকান বিস্তার",
        createdBy: adminUser.id,
      },
      {
        transactionCode: "TXN-2024-1002",
        customerId: customer1.id,
        loanId: loan1.id,
        transactionDate: new Date("2024-06-10"),
        type: TransactionType.INSTALLMENT_PAYMENT,
        amount: 25000,
        referenceNo: "REC-001",
        description: "কিস্তি আদায় - কিস্তি নং ১",
        createdBy: adminUser.id,
      },
      {
        transactionCode: "TXN-2024-1003",
        customerId: customer1.id,
        loanId: loan1.id,
        transactionDate: new Date("2024-07-10"),
        type: TransactionType.INSTALLMENT_PAYMENT,
        amount: 25000,
        referenceNo: "REC-002",
        description: "কিস্তি আদায় - কিস্তি নং ২",
        createdBy: adminUser.id,
      },
    ],
  });

  // 5. Create Document Metadata References
  await prisma.customerDocument.createMany({
    skipDuplicates: true,
    data: [
      {
        customerId: customer1.id,
        fileId: "DRV-99213-PHOTO",
        fileName: "customer_security_photo.jpg",
        fileType: "image/jpeg",
        fileSize: 124000,
        driveViewUrl: "https://drive.google.com/file/d/DRV-99213-PHOTO/view",
      },
      {
        customerId: customer1.id,
        fileId: "DRV-99214-NID-FRONT",
        fileName: "nid_front_photo.jpg",
        fileType: "image/jpeg",
        fileSize: 148000,
        driveViewUrl: "https://drive.google.com/file/d/DRV-99214-NID-FRONT/view",
      },
    ],
  });

  console.log("SUCCESS: PostgreSQL Supabase Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
