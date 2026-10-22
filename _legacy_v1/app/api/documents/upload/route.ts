import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { uploadDocumentToGoogleDrive } from "@/lib/google/drive";

// POST /api/documents/upload - Upload file to Google Drive and store metadata in PostgreSQL
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const customerId = formData.get("customerId") as string;
    const documentType = (formData.get("documentType") as string) || "security_photo";

    if (!file || !customerId) {
      return NextResponse.json(
        { success: false, error: "File and customer ID are required." },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 1. Upload file to Google Drive
    const driveResult = await uploadDocumentToGoogleDrive(
      buffer,
      `${documentType}_${Date.now()}_${file.name}`,
      file.type
    );

    // 2. Save document metadata & Drive reference ID into PostgreSQL
    const documentRecord = await prisma.customerDocument.create({
      data: {
        customerId,
        fileId: driveResult.fileId,
        fileName: driveResult.fileName,
        fileType: file.type,
        fileSize: file.size,
        driveViewUrl: driveResult.webViewLink || null,
      },
    });

    return NextResponse.json({
      success: true,
      data: documentRecord,
      message: "Document securely uploaded to Google Drive & recorded in PostgreSQL.",
    });
  } catch (error: any) {
    console.error("Error in document upload handler:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to upload document." },
      { status: 500 }
    );
  }
}
