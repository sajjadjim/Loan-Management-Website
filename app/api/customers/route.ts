import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { CustomerSchema } from "@/schemas";

// GET /api/customers - List members from PostgreSQL
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query") || "";

    const customers = await prisma.customer.findMany({
      where: query
        ? {
            OR: [
              { fullName: { contains: query, mode: "insensitive" } },
              { memberCode: { contains: query, mode: "insensitive" } },
              { phone: { contains: query } },
            ],
          }
        : undefined,
      include: {
        savingsAccount: true,
        loans: {
          select: {
            id: true,
            loanCode: true,
            loanAmount: true,
            paidAmount: true,
            remainingAmount: true,
            status: true,
          },
        },
        documents: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: customers });
  } catch (error: any) {
    console.error("Error fetching customers from PostgreSQL:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch customer records." },
      { status: 500 }
    );
  }
}

// POST /api/customers - Register new member in PostgreSQL
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = CustomerSchema.parse(body);

    // Create Customer + Savings Account in single database transaction
    const newCustomer = await prisma.$transaction(async (tx) => {
      const customer = await tx.customer.create({
        data: {
          memberCode: validatedData.memberCode,
          fullName: validatedData.fullName,
          fatherHusbandName: validatedData.fatherHusbandName,
          phone: validatedData.phone,
          address: validatedData.address,
          nidNumber: validatedData.nidNumber,
          joiningDate: validatedData.joiningDate ? new Date(validatedData.joiningDate) : new Date(),
          status: validatedData.status,
          notes: validatedData.notes,
        },
      });

      // Initialize Savings Vault Account
      await tx.savingsAccount.create({
        data: {
          customerId: customer.id,
          currentBalance: 0,
          totalDeposited: 0,
          totalWithdrawn: 0,
        },
      });

      return customer;
    });

    return NextResponse.json({ success: true, data: newCustomer }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating customer in PostgreSQL:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create customer record." },
      { status: 400 }
    );
  }
}
