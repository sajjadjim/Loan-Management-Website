import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

// GET /api/reports - Generate database report based on type and date range
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const reportType = searchParams.get("reportType") || "daily_collection";
    const startDateStr = searchParams.get("startDate");
    const endDateStr = searchParams.get("endDate");

    const start = startDateStr ? new Date(startDateStr) : new Date(0);
    const end = endDateStr ? new Date(`${endDateStr}T23:59:59.999Z`) : new Date();

    // 1. Calculate general summary numbers
    const totalTransactionsSum = await prisma.transaction.aggregate({
      where: {
        transactionDate: { gte: start, lte: end },
        isVoided: false,
      },
      _sum: { amount: true },
    });

    const totalOutstandingSum = await prisma.loan.aggregate({
      where: { status: { in: ["ACTIVE", "OVERDUE"] } },
      _sum: { remainingAmount: true },
    });

    const totalCollected = Number(totalTransactionsSum._sum.amount || 0);
    const totalOutstanding = Number(totalOutstandingSum._sum.remainingAmount || 0);

    let reportData: any[] = [];

    if (reportType === "outstanding") {
      reportData = await prisma.loan.findMany({
        where: { status: { in: ["ACTIVE", "OVERDUE"] } },
        include: {
          customer: {
            select: { id: true, memberCode: true, fullName: true, phone: true },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    } else if (reportType === "overdue") {
      reportData = await prisma.loan.findMany({
        where: { status: "OVERDUE" },
        include: {
          customer: {
            select: { id: true, memberCode: true, fullName: true, phone: true },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    } else if (reportType === "member_summary") {
      reportData = await prisma.customer.findMany({
        include: {
          savingsAccount: true,
          loans: {
            select: { id: true, remainingAmount: true, status: true },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    } else {
      // daily_collection or monthly_collection
      reportData = await prisma.transaction.findMany({
        where: {
          transactionDate: { gte: start, lte: end },
          isVoided: false,
        },
        include: {
          customer: {
            select: { id: true, memberCode: true, fullName: true, phone: true },
          },
          user: {
            select: { fullName: true, email: true },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        reportType,
        totalCollected,
        totalOutstanding,
        generatedAt: new Date().toISOString(),
        rows: reportData,
      },
    });
  } catch (error: any) {
    console.error("Error generating report in PostgreSQL:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate database report." },
      { status: 500 }
    );
  }
}
