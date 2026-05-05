import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Hexiaojiong Portfolio",
  description: "AI-native indie developer portfolio",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`h-full ${inter.variable}`} data-scroll-behavior="smooth" data-theme="light">
      <body className={`min-h-full antialiased ${inter.className}`}>{children}</body>
    </html>
  );
}
