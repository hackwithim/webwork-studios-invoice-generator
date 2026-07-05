import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import DocumentPreview from "@/components/document-preview";

export default async function ReceiptViewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const receipt = await prisma.receipt.findUnique({
    where: { id },
    include: {
      invoice: {
        include: {
          client: true
        }
      }
    }
  });

  if (!receipt) {
    notFound();
  }

  const company = await prisma.company.findFirst();

  return <DocumentPreview type="Receipt" data={receipt} company={company} />;
}
