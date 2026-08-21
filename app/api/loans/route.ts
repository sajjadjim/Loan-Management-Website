import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { LoanSchema } from "@/schemas";
import { generateInstallmentSchedule } from "@/lib/loan/calculateInstallment";
import { computeLoanSummary } from "@/lib/loan/loanSummary";

// GET /api/loans - Fetch all loans from PostgreSQL database
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const loans = await prisma.loan.findMany({
      where: status && status !== "ALL" ? { status: status as any } : undefined,
      include: {
        customer: {
          select: {
            id: true,
            memberCode: true,
            fullName: true,
            phone: true,
          },
        },
        installments: {
          orderBy: { installmentNo: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: loans });
  } catch (error: any) {
    console.error("Error fetching loans from PostgreSQL:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch loans from database." },
      { status: 500 }
    );
  }
}

// POST /api/loans - Create new loan in PostgreSQL
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = LoanSchema.parse(body);

    const summary = computeLoanSummary(
      validated.loanAmount,
      validated.interestRate,
      validated.durationMonths,
      validated.totalInstallments,
      0,
      validated.interestType
    );

    const startDate = new Date(validated.startDate);
    const scheduleItems = generateInstallmentSchedule({
      principal: validated.loanAmount,
      annualRatePercentage: validated.interestRate,
      durationMonths: validated.durationMonths,
      totalInstallments: validated.totalInstallments,
      startDate,
      frequency: validated.frequency,
      interestType: validated.interestType,
    });

    const loanCode = `LN-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    // Create Loan, Installment Schedule, and Disbursement Transaction in single ACID transaction
    const newLoan = await prisma.$transaction(async (tx) => {
      const loan = await tx.loan.create({
        data: {
          customerId: validated.customerId,
          loanCode,
          loanAmount: validated.loanAmount,
          interestRate: validated.interestRate,
          interestType: validated.interestType,
          loanPurpose: validated.loanPurpose || "General Loan",
          startDate,
          durationMonths: validated.durationMonths,
          frequency: validated.frequency,
          totalInstallments: validated.totalInstallments,
          installmentAmount: summary.installmentAmount,
          totalPayable: summary.totalPayable,
          totalInterest: summary.totalInterest,
          paidAmount: 0,
          remainingAmount: summary.totalPayable,
          status: "ACTIVE",
          installments: {
            create: scheduleItems.map((item) => ({
              installmentNo: item.installmentNo,
              dueDate: item.dueDate,
              principalAmount: item.principalAmount,
              interestAmount: item.interestAmount,
              totalDue: item.totalDue,
              paidAmount: 0,
              remainingAmount: item.totalDue,
              status: "PENDING",
            })),
          },
        },
      });

      // Find an admin user to tag as creator
      const defaultUser = await tx.user.findFirst();
      const userId = defaultUser ? defaultUser.id : validated.customerId;

      // Log Disbursement Transaction
      await tx.transaction.create({
        data: {
          transactionCode: `TXN-${Date.now().toString().slice(-6)}`,
          customerId: validated.customerId,
          loanId: loan.id,
          type: "LOAN_DISBURSEMENT",
          amount: validated.loanAmount,
          description: `Loan Disbursement - ${loan.loanPurpose}`,
          createdBy: userId,
        },
      });

      // Audit Log Entry
      await tx.auditLog.create({
        data: {
          userId,
          action: "LOAN_CREATE",
          entityName: "Loan",
          entityId: loan.id,
          newValue: JSON.parse(JSON.stringify(loan)),
        },
      });

      return loan;
    });

    return NextResponse.json({ success: true, data: newLoan }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating loan in PostgreSQL:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create loan in database." },
      { status: 400 }
    );
  }
}
