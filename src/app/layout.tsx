import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import { Toaster as SonnerToaster } from "sonner";
import { Toaster as HotToaster } from "react-hot-toast";
import CommandPalette from "@/components/command-palette";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "WEBWORK STUDIOS — Invoice & Document Generator",
  description: "Enterprise-grade Invoice, Quotation & Payment Receipt generator for Webwork Studios",
  metadataBase: new URL("http://localhost:3000"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${poppins.variable} h-full antialiased font-sans`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-brand-bg text-primary" suppressHydrationWarning>
        <main className="flex-1 flex flex-col">{children}</main>
        <SonnerToaster position="top-right" richColors />
        <HotToaster position="top-center" />
        <CommandPalette />
      </body>
    </html>
  );
}
