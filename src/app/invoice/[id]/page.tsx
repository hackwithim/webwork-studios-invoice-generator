import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import DocumentPreview from "@/components/document-preview";

export default async function InvoiceViewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: {
      client: true,
      items: true
    }
  });

  if (!invoice) {
    notFound();
  }

  const company = await prisma.company.findFirst();

  return <DocumentPreview type="Invoice" data={invoice} company={company} />;
}
