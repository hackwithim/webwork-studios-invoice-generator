"use server";

import prisma from "@/lib/prisma";
import { verifyFilesExist } from "@/lib/drive";

export async function syncDriveFiles() {
  try {
    // 1. Gather all driveFileIds
    const invoices = await prisma.invoice.findMany({
      where: { driveFileId: { not: null } },
      select: { id: true, driveFileId: true }
    });
    
    const quotations = await prisma.quotation.findMany({
      where: { driveFileId: { not: null } },
      select: { id: true, driveFileId: true }
    });
    
    const receipts = await prisma.receipt.findMany({
      where: { driveFileId: { not: null } },
      select: { id: true, driveFileId: true }
    });

    const fileIdToModel = new Map<string, { type: string, id: string }>();
    const allFileIds: string[] = [];

    const addDocs = (docs: any[], type: string) => {
      docs.forEach(doc => {
        if (doc.driveFileId) {
          fileIdToModel.set(doc.driveFileId, { type, id: doc.id });
          allFileIds.push(doc.driveFileId);
        }
      });
    };

    addDocs(invoices, 'Invoice');
    addDocs(quotations, 'Quotation');
    addDocs(receipts, 'Receipt');

    if (allFileIds.length === 0) return { verified: 0, missing: 0 };

    // 2. Verify which ones actually exist on Drive
    const foundIds = await verifyFilesExist(allFileIds);

    // 3. Identify missing ones and update the database
    let missingCount = 0;
    
    for (const fileId of allFileIds) {
      if (!foundIds.has(fileId)) {
        missingCount++;
        const doc = fileIdToModel.get(fileId);
        if (doc) {
          if (doc.type === 'Invoice') {
            await prisma.invoice.update({ where: { id: doc.id }, data: { driveFileId: null } });
          } else if (doc.type === 'Quotation') {
            await prisma.quotation.update({ where: { id: doc.id }, data: { driveFileId: null } });
          } else if (doc.type === 'Receipt') {
            await prisma.receipt.update({ where: { id: doc.id }, data: { driveFileId: null } });
          }
        }
      }
    }

    return { verified: foundIds.size, missing: missingCount };
  } catch (error) {
    console.error("Failed to sync drive files:", error);
    return { error: "Sync failed" };
  }
}
