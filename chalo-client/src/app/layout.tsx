import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/auth.context";
import ToasterProvider from "@/components/common/ToasterProvider";

export const metadata: Metadata = {
  title: "Chalo - Skip the wait, embrace the journey",
  description: "On-demand, reliable, transparent ride-hailing platform.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased scroll-smooth" data-scroll-behavior="smooth">
      <body className="min-h-full flex flex-col font-sans bg-[#FDFCF8] text-[#292524] relative selection:bg-[#FFB7B2] selection:text-[#292524]">
        <AuthProvider>
          {children}
          <ToasterProvider />
        </AuthProvider>
      </body>
    </html>
  );
}
