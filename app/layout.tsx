import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "HealPoint Teleconsultation",
  description: "Advanced healthcare at your fingertips",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable}`}>
      <body className="font-sans bg-[#FAFAFA] text-[#0A1628] antialiased">
        <Navbar />
        <main className="min-h-[calc(100vh-64px)] overflow-x-hidden">
          {children}
        </main>
      </body>
    </html>
  );
}
