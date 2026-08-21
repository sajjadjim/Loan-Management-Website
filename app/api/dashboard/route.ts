import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

// GET /api/dashboard - Compute live metrics directly from PostgreSQL database
export async function GET() {
  try {
    const totalMembers = await prisma.customer.count();
    const activeLoansCount = await prisma.loan.count({ where: { status: "ACTIVE" } });
    const overdueLoansCount = await prisma.loan.count({ where: { status: "OVERDUE" } });

    const loanAggregates = await prisma.loan.aggregate({
      _sum: {
        loanAmount: true,
        paidAmount: true,
        remainingAmount: true,
      },
    });

    const overdueAggregates = await prisma.loan.aggregate({
      where: { status: "OVERDUE" },
      _sum: {
        remainingAmount: true,
      },
    });

    const savingsAggregates = await prisma.savingsAccount.aggregate({
      _sum: {
        currentBalance: true,
      },
    });

    const recentLoans = await prisma.loan.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        customer: { select: { fullName: true, memberCode: true } },
      },
    });

    const recentTransactions = await prisma.transaction.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        customer: { select: { fullName: true, memberCode: true } },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        totalMembers,
        activeLoansCount,
        overdueLoansCount,
        totalDisbursed: Number(loanAggregates._sum.loanAmount || 0),
        totalCollected: Number(loanAggregates._sum.paidAmount || 0),
        totalOutstanding: Number(loanAggregates._sum.remainingAmount || 0),
        overdueAmount: Number(overdueAggregates._sum.remainingAmount || 0),
        totalSavings: Number(savingsAggregates._sum.currentBalance || 0),
        recentLoans,
        recentTransactions,
      },
    });
  } catch (error: any) {
    console.error("Error computing dashboard metrics from PostgreSQL:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch dashboard metrics." },
      { status: 500 }
    );
  }
}
