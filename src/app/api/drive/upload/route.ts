import { NextRequest, NextResponse } from "next/server";
import { ensureFolderExists, uploadFileToDrive } from "@/lib/drive";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const documentType = formData.get("documentType") as string; // "Invoice", "Quotation", "Receipt"
    const documentNumber = formData.get("documentNumber") as string;
    
    if (!file || !documentType || !documentNumber) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 1. Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 2. Ensure folder exists for this document type (e.g. "Invoices" folder)
    const folderName = documentType + "s"; // Invoice -> Invoices
    const folderId = await ensureFolderExists(folderName);
    
    const documentId = formData.get("documentId") as string;
    let existingDriveFileId: string | null = null;
    
    // Check if it already exists
    if (documentId) {
      if (documentType === "Invoice") {
        const doc = await prisma.invoice.findUnique({ where: { id: documentId } });
        existingDriveFileId = doc?.driveFileId || null;
      } else if (documentType === "Quotation") {
        const doc = await prisma.quotation.findUnique({ where: { id: documentId } });
        existingDriveFileId = doc?.driveFileId || null;
      } else if (documentType === "Receipt") {
        const doc = await prisma.receipt.findUnique({ where: { id: documentId } });
        existingDriveFileId = doc?.driveFileId || null;
      }
    }
    const fileName = `${documentType}_${documentNumber}.pdf`;
    let driveFile: { id?: string | null } | null = null;
    
    // If it exists, try to update it in place
    if (existingDriveFileId) {
      try {
        const { updateFileInDrive } = await import("@/lib/drive");
        driveFile = await updateFileInDrive(existingDriveFileId, "application/pdf", buffer);
      } catch (e: any) {
        console.warn("Failed to update existing file in Drive, falling back to upload:", e.message);
        // Fallback to upload new file below
        existingDriveFileId = null; 
      }
    }

    // If no existing file (or update failed), search by filename in the drive folder
    if (!existingDriveFileId) {
      const { findFileInFolderByName } = await import("@/lib/drive");
      existingDriveFileId = await findFileInFolderByName(folderId, fileName);
      
      if (existingDriveFileId) {
        try {
          const { updateFileInDrive } = await import("@/lib/drive");
          driveFile = await updateFileInDrive(existingDriveFileId, "application/pdf", buffer);
        } catch (e: any) {
          console.warn("Failed to update found file in Drive, falling back to upload:", e.message);
          existingDriveFileId = null;
        }
      }
    }

    // If still no existing file (or update failed), create a new one
    if (!existingDriveFileId) {
      driveFile = await uploadFileToDrive(folderId, fileName, "application/pdf", buffer);
    }
    
    if (!driveFile || !driveFile.id) {
       throw new Error("Failed to upload/update drive file: returned null");
    }

    // 4. Save driveFileId to database
    const driveFileId = driveFile.id;
    
    if (documentId && driveFileId) {
      if (documentType === "Invoice") {
        await prisma.invoice.update({ where: { id: documentId }, data: { driveFileId } });
      } else if (documentType === "Quotation") {
        await prisma.quotation.update({ where: { id: documentId }, data: { driveFileId } });
      } else if (documentType === "Receipt") {
        await prisma.receipt.update({ where: { id: documentId }, data: { driveFileId } });
      }
    }

    return NextResponse.json({ success: true, file: driveFile });
  } catch (error: any) {
    console.error("Drive upload error:", error);
    
    // Check for the specific quota error
    const errorMessage = error.message || "Upload failed";
    if (errorMessage.includes("storage quota") || errorMessage.includes("Leverage shared drives")) {
      return NextResponse.json(
        { error: "Google Drive Error: Free Gmail accounts cannot use Service Accounts. Please use a Google Workspace Shared Drive or disable this feature." },
        { status: 403 }
      );
    }
    
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
