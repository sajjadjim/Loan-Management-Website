import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

// GET /api/transactions - Fetch all financial transactions from PostgreSQL database
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const search = searchParams.get("search");

    const transactions = await prisma.transaction.findMany({
      where: {
        type: type && type !== "ALL" ? (type as any) : undefined,
        ...(search
          ? {
              OR: [
                { transactionCode: { contains: search, mode: "insensitive" } },
                { customer: { fullName: { contains: search, mode: "insensitive" } } },
                { customer: { memberCode: { contains: search, mode: "insensitive" } } },
              ],
            }
          : {}),
      },
      include: {
        customer: {
          select: {
            id: true,
            memberCode: true,
            fullName: true,
            phone: true,
          },
        },
        user: {
          select: {
            fullName: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: transactions });
  } catch (error: any) {
    console.error("Error fetching transactions from PostgreSQL:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch transactions from database." },
      { status: 500 }
    );
  }
}

// PATCH /api/transactions - Void / Reverse a transaction
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Transaction ID is required." },
        { status: 400 }
      );
    }

    const updatedTx = await prisma.transaction.update({
      where: { id },
      data: {
        isVoided: true,
        description: `[VOIDED/REVERSED]`,
      },
    });

    return NextResponse.json({ success: true, data: updatedTx });
  } catch (error: any) {
    console.error("Error voiding transaction in PostgreSQL:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to void transaction." },
      { status: 500 }
    );
  }
}
