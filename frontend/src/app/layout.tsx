import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SupabaseProvider } from "@/components/layout/supabase-provider";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NovaCart - Luxury Fashion and Lifestyle Store",
  description: "Discover curated fashion, footwear, accessories, and tech in a premium dark storefront.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="min-h-screen flex flex-col bg-[#0b0614] text-slate-100 antialiased">
        <SupabaseProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </SupabaseProvider>
      </body>
    </html>
  );
}
