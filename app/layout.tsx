import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Diaymax Admin",
  description: "Panneau d'administration Diaymax",
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${inter.variable} min-h-screen antialiased`}
    >
      <body className="min-h-screen bg-gray-50 text-gray-900">{children}</body>
    </html>
  );
}
