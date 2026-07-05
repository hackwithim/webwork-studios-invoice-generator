/**
 * Convert a numeric amount to Indian words (rupees)
 * e.g. 5000 → "Five Thousand Rupees Only"
 */
const ones = [
  "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
  "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
  "Seventeen", "Eighteen", "Nineteen",
];
const tens = [
  "", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety",
];

function convertHundreds(n: number): string {
  if (n === 0) return "";
  if (n < 20) return ones[n] + " ";
  if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? " " + ones[n % 10] : "") + " ";
  return ones[Math.floor(n / 100)] + " Hundred " + convertHundreds(n % 100);
}

export function amountToWords(amount: number): string {
  if (amount === 0) return "Zero Rupees Only";

  const intPart = Math.floor(amount);
  const decPart = Math.round((amount - intPart) * 100);

  let words = "";

  if (intPart >= 10000000) {
    words += convertHundreds(Math.floor(intPart / 10000000)) + "Crore ";
  }
  if (intPart >= 100000) {
    words += convertHundreds(Math.floor((intPart % 10000000) / 100000)) + "Lakh ";
  }
  if (intPart >= 1000) {
    words += convertHundreds(Math.floor((intPart % 100000) / 1000)) + "Thousand ";
  }
  if (intPart >= 100) {
    words += convertHundreds(Math.floor((intPart % 1000) / 100)) + "Hundred ";
  }
  words += convertHundreds(intPart % 100);

  words = words.trim() + " Rupees";

  if (decPart > 0) {
    words += " and " + convertHundreds(decPart).trim() + " Paise";
  }

  return words + " Only";
}

/** Format a number as Indian currency */
export function formatCurrency(amount: number, currency = "INR"): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/** Format date as "Jun 24, 2026" */
export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/** Generate unique invoice/quotation/receipt numbers */
export function generateDocNumber(prefix: string, seq: number): string {
  return `${prefix}${String(seq).padStart(3, "0")}`;
}

/** Calculate GST split — CGST + SGST (intra-state) or IGST (inter-state) */
export function calculateGST(
  amount: number,
  gstRate: number,
  isIGST = false
): { cgst: number; sgst: number; igst: number; total: number } {
  const gstAmount = (amount * gstRate) / 100;
  if (isIGST) {
    return { cgst: 0, sgst: 0, igst: gstAmount, total: gstAmount };
  }
  const half = gstAmount / 2;
  return { cgst: half, sgst: half, igst: 0, total: gstAmount };
}

/** Calculate line item total */
export function calcLineTotal(
  qty: number,
  rate: number,
  discount: number,
  gstRate: number
): { base: number; discounted: number; gstAmount: number; total: number } {
  const base = qty * rate;
  const discountAmount = (base * discount) / 100;
  const discounted = base - discountAmount;
  const gstAmount = (discounted * gstRate) / 100;
  const total = discounted + gstAmount;
  return { base, discounted, gstAmount, total };
}

/** Truncate long strings */
export function truncate(str: string, maxLen = 40): string {
  return str.length > maxLen ? str.slice(0, maxLen) + "…" : str;
}

/** Get status color classes */
export function getStatusColor(status: string): string {
  const map: Record<string, string> = {
    Draft: "bg-gray-100 text-gray-600",
    Sent: "bg-blue-100 text-blue-700",
    Paid: "bg-green-100 text-green-700",
    Accepted: "bg-green-100 text-green-700",
    Overdue: "bg-red-100 text-red-700",
    Rejected: "bg-red-100 text-red-700",
    Cancelled: "bg-gray-100 text-gray-500",
    Expired: "bg-orange-100 text-orange-700",
    Pending: "bg-yellow-100 text-yellow-700",
  };
  return map[status] ?? "bg-gray-100 text-gray-600";
}
