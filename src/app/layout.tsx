import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ToastProvider } from '@/components/ui/ToastContext';
import { SessionProvider } from '@/components/ui/SessionContext';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MarketSphere | Premium Multi-Vendor E-Commerce Marketplace",
  description: "MarketSphere connects buyers, sellers, and stores for a seamless, secure, and modern shopping experience.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-50">
        <ToastProvider>
          <SessionProvider>
            {children}
          </SessionProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
