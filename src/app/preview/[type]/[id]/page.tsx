import DocumentPreview from "@/components/document-preview";
import { getInvoiceById } from "@/actions/invoice";
import { getQuotationById } from "@/actions/quotation";
import { getReceiptById } from "@/actions/receipt";
import { getCompany } from "@/actions/company";
import { notFound } from "next/navigation";

export default async function ServerPreviewPage({
  params,
  searchParams
}: {
  params: Promise<{ type: string; id: string }>,
  searchParams: Promise<{ autoBackup?: string }>
}) {
  const resolvedParams = await params;
  const { type, id } = resolvedParams;
  const resolvedSearchParams = await searchParams;
  const isBulkBackup = resolvedSearchParams.autoBackup === "true";
  
  // Validate type
  if (!["Invoice", "Quotation", "Receipt"].includes(type)) {
    return notFound();
  }

  // Fetch document
  let documentData = null;
  try {
    if (type === "Invoice") {
      documentData = await getInvoiceById(id);
    } else if (type === "Quotation") {
      documentData = await getQuotationById(id);
    } else if (type === "Receipt") {
      documentData = await getReceiptById(id);
    }
  } catch (error) {
    console.error(`Error fetching ${type} ${id}:`, error);
  }

  if (!documentData) {
    console.error(`Document not found: ${type} ${id}`);
    return (
      <div className="p-8 text-center text-red-500">
        <h1>Document Not Found</h1>
        <p>Type: {type}, ID: {id}</p>
      </div>
    );
  }

  // Fetch company
  const company = await getCompany();

  return (
    <div className="bg-white min-h-screen">
      <DocumentPreview 
        type={type as "Invoice" | "Quotation" | "Receipt"} 
        data={documentData} 
        company={company} 
        isServerPreview={true} 
        isBulkBackup={isBulkBackup}
      />
    </div>
  );
}
