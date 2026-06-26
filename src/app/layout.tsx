import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import CursorWaveEffect from "@/components/CursorWaveEffect";
import FloatingRobot from "@/components/FloatingRobot";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Smart Productivity Assistant",
  description: "AI-Powered SaaS Dashboard for Task Management and Knowledge Organization",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full bg-[#F8FAFC] dark:bg-[#0B0F19] transition-colors duration-300">
        <CursorWaveEffect />
        <FloatingRobot />
        {children}
      </body>
    </html>
  );
}
