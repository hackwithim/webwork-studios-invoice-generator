"use server";

import nodemailer from "nodemailer";
import prisma from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/utils";

const getTransporter = (company?: any) => {
  return nodemailer.createTransport({
    host: company?.smtpHost || process.env.SMTP_HOST || "smtp.gmail.com",
    port: company?.smtpPort || parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
    auth: {
      user: company?.smtpUser || process.env.SMTP_USER,
      pass: company?.smtpPassword || process.env.SMTP_PASS,
    },
  });
};

const FROM_EMAIL = process.env.SMTP_FROM || "rccindia@webworksstudios.com";

// Base URL for links (usually set in prod, fallback to localhost)
const getBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
};

// HTML Template Helper
const getEmailLayout = (title: string, companyName: string, content: string, customMessage?: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #334155; background-color: #f8fafc; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); }
    .header { background-color: #0B1F3A; padding: 32px 40px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 24px; font-weight: 600; letter-spacing: -0.02em; }
    .content { padding: 40px; }
    .greeting { font-size: 18px; font-weight: 600; color: #0f172a; margin-top: 0; }
    .custom-notice { background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 16px 20px; margin: 24px 0; border-radius: 0 8px 8px 0; color: #166534; font-size: 15px; }
    .custom-notice-title { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #15803d; margin-bottom: 4px; display: block; }
    .details-box { background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 24px; margin: 24px 0; }
    .detail-row { display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 15px; }
    .detail-row:last-child { margin-bottom: 0; }
    .detail-label { color: #64748b; }
    .detail-value { font-weight: 600; color: #0f172a; }
    .btn-container { text-align: center; margin: 32px 0; }
    .btn { display: inline-block; background-color: #2563EB; color: #ffffff; text-decoration: none; font-weight: 600; padding: 14px 28px; border-radius: 8px; font-size: 16px; transition: background-color 0.2s; }
    .btn:hover { background-color: #1d4ed8; }
    .footer { text-align: center; padding: 24px 40px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; color: #94a3b8; font-size: 13px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${companyName}</h1>
    </div>
    <div class="content">
      ${content}
      ${customMessage ? `
      <div class="custom-notice">
        <span class="custom-notice-title">Special Notice</span>
        ${customMessage.replace(/\n/g, '<br/>')}
      </div>` : ''}
    </div>
    <div class="footer">
      <p>This is an automated message generated on behalf of ${companyName}.</p>
      <p>&copy; ${new Date().getFullYear()} ${companyName}. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;

export async function sendInvoiceEmail(invoiceId: string, customMessage?: string, pdfBase64?: string) {
  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: { client: true, company: true }
    });

    if (!invoice || !invoice.client || !invoice.client.email) {
      throw new Error("Invoice or client email not found");
    }

    const documentUrl = `${getBaseUrl()}/invoice/${invoiceId}`;
    
    const content = `
      <p class="greeting">Dear ${invoice.client.clientName},</p>
      <p>We hope this email finds you well. Please find the details for your recent invoice <strong>${invoice.invoiceNumber}</strong> below.</p>
      
      <div class="details-box">
        <div class="detail-row">
          <span class="detail-label">Invoice Number:</span>
          <span class="detail-value">${invoice.invoiceNumber}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Issue Date:</span>
          <span class="detail-value">${formatDate(invoice.invoiceDate)}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Due Date:</span>
          <span class="detail-value" style="color: #ef4444;">${formatDate(invoice.dueDate)}</span>
        </div>
        <div class="detail-row" style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #cbd5e1;">
          <span class="detail-label" style="font-weight: 600;">Total Amount Due:</span>
          <span class="detail-value" style="font-size: 18px; color: #2563EB;">${formatCurrency(invoice.grandTotal)}</span>
        </div>
      </div>
      
      <div class="btn-container">
        <a href="${documentUrl}" class="btn" style="background-color: #2563EB; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; display: inline-block; font-weight: 600;">View / Download Invoice</a>
      </div>
      <p style="text-align: center; color: #64748b; font-size: 14px;">You can view, print, or download a PDF copy of your invoice via the secure link above.</p>
    `;

    const html = getEmailLayout("Invoice", invoice.company.name, content, customMessage);
    const transporter = getTransporter(invoice.company);

    const mailOptions: any = {
      from: `"${invoice.company.name}" <${FROM_EMAIL}>`,
      to: invoice.client.email,
      subject: `Invoice ${invoice.invoiceNumber} from ${invoice.company.name}`,
      html,
    };

    if (pdfBase64) {
      mailOptions.attachments = [
        {
          filename: `Invoice_${invoice.invoiceNumber}.pdf`,
          content: pdfBase64.split("base64,")[1] || pdfBase64,
          encoding: 'base64'
        }
      ];
    }

    const info = await transporter.sendMail(mailOptions);

    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error("Error sending invoice email:", error);
    throw new Error(error.message || "Failed to send email");
  }
}

export async function sendQuotationEmail(quotationId: string, customMessage?: string, pdfBase64?: string) {
  try {
    const quotation = await prisma.quotation.findUnique({
      where: { id: quotationId },
      include: { client: true, company: true }
    });

    if (!quotation || !quotation.client || !quotation.client.email) {
      throw new Error("Quotation or client email not found");
    }

    const documentUrl = `${getBaseUrl()}/quotation/${quotationId}`;
    
    const content = `
      <p class="greeting">Dear ${quotation.client.clientName},</p>
      <p>Thank you for considering ${quotation.company.name} for your project. Please find our detailed quotation <strong>${quotation.quotationNumber}</strong> outlined below.</p>
      
      <div class="details-box">
        <div class="detail-row">
          <span class="detail-label">Quotation Number:</span>
          <span class="detail-value">${quotation.quotationNumber}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Date Prepared:</span>
          <span class="detail-value">${formatDate(quotation.invoiceDate)}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Valid Until:</span>
          <span class="detail-value">${formatDate(quotation.validityDate)}</span>
        </div>
        <div class="detail-row" style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #cbd5e1;">
          <span class="detail-label" style="font-weight: 600;">Estimated Total:</span>
          <span class="detail-value" style="font-size: 18px; color: #2563EB;">${formatCurrency(quotation.grandTotal)}</span>
        </div>
      </div>
      
      <div class="btn-container">
        <a href="${documentUrl}" class="btn" style="background-color: #2563EB; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; display: inline-block; font-weight: 600;">View / Download Quotation</a>
      </div>
      <p style="text-align: center; color: #64748b; font-size: 14px;">If you have any questions or require revisions, please don't hesitate to reach out.</p>
    `;

    const html = getEmailLayout("Quotation", quotation.company.name, content, customMessage);
    const transporter = getTransporter(quotation.company);

    const mailOptions: any = {
      from: `"${quotation.company.name}" <${FROM_EMAIL}>`,
      to: quotation.client.email,
      subject: `Quotation ${quotation.quotationNumber} from ${quotation.company.name}`,
      html,
    };

    if (pdfBase64) {
      mailOptions.attachments = [
        {
          filename: `Quotation_${quotation.quotationNumber}.pdf`,
          content: pdfBase64.split("base64,")[1] || pdfBase64,
          encoding: 'base64'
        }
      ];
    }

    const info = await transporter.sendMail(mailOptions);

    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error("Error sending quotation email:", error);
    throw new Error(error.message || "Failed to send email");
  }
}

export async function sendReceiptEmail(receiptId: string, customMessage?: string, pdfBase64?: string) {
  try {
    const receipt = await prisma.receipt.findUnique({
      where: { id: receiptId },
      include: {
        company: true,
        invoice: { include: { client: true } }
      }
    });

    if (!receipt || !receipt.invoice || !receipt.invoice.client || !receipt.invoice.client.email) {
      throw new Error("Receipt or client email not found");
    }

    const documentUrl = `${getBaseUrl()}/receipt/${receiptId}`;
    
    const content = `
      <p class="greeting">Dear ${receipt.invoice.client.clientName},</p>
      <p>This email is to confirm that we have successfully received your payment. Thank you for your prompt business.</p>
      
      <div class="details-box">
        <div class="detail-row">
          <span class="detail-label">Receipt Number:</span>
          <span class="detail-value">${receipt.receiptNumber}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Payment Date:</span>
          <span class="detail-value">${formatDate(receipt.paymentDate)}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Applied To Invoice:</span>
          <span class="detail-value">${receipt.invoice.invoiceNumber}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Payment Method:</span>
          <span class="detail-value">${receipt.paymentMethod}</span>
        </div>
        <div class="detail-row" style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #cbd5e1;">
          <span class="detail-label" style="font-weight: 600;">Amount Received:</span>
          <span class="detail-value" style="font-size: 18px; color: #22c55e;">${formatCurrency(receipt.amountPaid)}</span>
        </div>
      </div>
      
      <div class="btn-container">
        <a href="${documentUrl}" class="btn" style="background-color: #2563EB; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; display: inline-block; font-weight: 600;">View / Download Receipt</a>
      </div>
    `;

    const html = getEmailLayout("Receipt", receipt.company.name, content, customMessage);
    const transporter = getTransporter(receipt.company);

    const mailOptions: any = {
      from: `"${receipt.company.name}" <${FROM_EMAIL}>`,
      to: receipt.invoice.client.email,
      subject: `Payment Receipt ${receipt.receiptNumber} from ${receipt.company.name}`,
      html,
    };

    if (pdfBase64) {
      mailOptions.attachments = [
        {
          filename: `Receipt_${receipt.receiptNumber}.pdf`,
          content: pdfBase64.split("base64,")[1] || pdfBase64,
          encoding: 'base64'
        }
      ];
    }

    const info = await transporter.sendMail(mailOptions);

    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error("Error sending receipt email:", error);
    throw new Error(error.message || "Failed to send email");
  }
}
