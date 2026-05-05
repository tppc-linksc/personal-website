import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hexiaojiong Portfolio",
  description: "AI-native indie developer portfolio",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full" data-scroll-behavior="smooth" data-theme="light">
      <body className="min-h-full antialiased">{children}</body>
    </html>
  );
}
