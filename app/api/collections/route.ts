import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { CollectionPaymentSchema } from "@/schemas";

// POST /api/collections - Record collection entry in PostgreSQL inside an ACID transaction
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = CollectionPaymentSchema.parse(body);

    const result = await prisma.$transaction(async (tx) => {
      // Find system user
      const user = await tx.user.findFirst();
      const userId = user ? user.id : validated.customerId;

      let updatedLoan = null;
      let loanTxn = null;

      // 1. Process Loan Repayment if loanId provided
      if (validated.loanId && validated.loanPaymentAmount > 0) {
        const loan = await tx.loan.findUnique({
          where: { id: validated.loanId },
        });

        if (loan) {
          const currentPaid = Number(loan.paidAmount);
          const totalPayable = Number(loan.totalPayable);
          const newPaidTotal = currentPaid + validated.loanPaymentAmount;
          const newRemaining = Math.max(0, totalPayable - newPaidTotal);
          const isCompleted = newRemaining <= 0;

          updatedLoan = await tx.loan.update({
            where: { id: loan.id },
            data: {
              paidAmount: newPaidTotal,
              remainingAmount: newRemaining,
              status: isCompleted ? "COMPLETED" : "ACTIVE",
            },
          });

          // Create Loan Payment Transaction Record
          loanTxn = await tx.transaction.create({
            data: {
              transactionCode: `TXN-${Date.now().toString().slice(-6)}`,
              customerId: validated.customerId,
              loanId: loan.id,
              type: "INSTALLMENT_PAYMENT",
              amount: validated.loanPaymentAmount,
              referenceNo: validated.referenceNo || `REC-${Date.now().toString().slice(-4)}`,
              description: validated.note || "Loan Installment Collection",
              createdBy: userId,
            },
          });
        }
      }

      // 2. Process Savings Deposit / Withdrawal
      let savings = await tx.savingsAccount.findUnique({
        where: { customerId: validated.customerId },
      });

      if (!savings) {
        savings = await tx.savingsAccount.create({
          data: { customerId: validated.customerId },
        });
      }

      let updatedSavings = savings;
      if (validated.savingsDepositAmount > 0) {
        const newBal = Number(savings.currentBalance) + validated.savingsDepositAmount;
        const newDep = Number(savings.totalDeposited) + validated.savingsDepositAmount;

        updatedSavings = await tx.savingsAccount.update({
          where: { id: savings.id },
          data: {
            currentBalance: newBal,
            totalDeposited: newDep,
          },
        });

        await tx.transaction.create({
          data: {
            transactionCode: `TXN-SAV-${Date.now().toString().slice(-6)}`,
            customerId: validated.customerId,
            savingsAccountId: savings.id,
            type: "SAVINGS_DEPOSIT",
            amount: validated.savingsDepositAmount,
            description: "Savings Account Deposit",
            createdBy: userId,
          },
        });
      }

      if (validated.savingsWithdrawalAmount > 0) {
        const newBal = Math.max(0, Number(savings.currentBalance) - validated.savingsWithdrawalAmount);
        const newWith = Number(savings.totalWithdrawn) + validated.savingsWithdrawalAmount;

        updatedSavings = await tx.savingsAccount.update({
          where: { id: savings.id },
          data: {
            currentBalance: newBal,
            totalWithdrawn: newWith,
          },
        });

        await tx.transaction.create({
          data: {
            transactionCode: `TXN-WTH-${Date.now().toString().slice(-6)}`,
            customerId: validated.customerId,
            savingsAccountId: savings.id,
            type: "SAVINGS_WITHDRAWAL",
            amount: validated.savingsWithdrawalAmount,
            description: "Savings Account Withdrawal",
            createdBy: userId,
          },
        });
      }

      // 3. Create Audit Trail
      await tx.auditLog.create({
        data: {
          userId,
          action: "COLLECTION_PAYMENT_RECORD",
          entityName: "Transaction",
          entityId: loanTxn ? loanTxn.id : validated.customerId,
          newValue: {
            loanPaymentAmount: validated.loanPaymentAmount,
            savingsDepositAmount: validated.savingsDepositAmount,
            savingsWithdrawalAmount: validated.savingsWithdrawalAmount,
          },
        },
      });

      return {
        updatedLoan,
        updatedSavings,
        receiptNo: validated.referenceNo || `REC-${Date.now().toString().slice(-6)}`,
      };
    });

    return NextResponse.json({
      success: true,
      data: result,
      message: "Collection record successfully saved to PostgreSQL database!",
    });
  } catch (error: any) {
    console.error("Error processing collection in PostgreSQL:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process collection entry." },
      { status: 500 }
    );
  }
}
