import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import DocumentPreview from "@/components/document-preview";

export default async function QuotationViewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const quotation = await prisma.quotation.findUnique({
    where: { id },
    include: {
      client: true,
      items: true
    }
  });

  if (!quotation) {
    notFound();
  }

  const company = await prisma.company.findFirst();

  return <DocumentPreview type="Quotation" data={quotation} company={company} />;
}
