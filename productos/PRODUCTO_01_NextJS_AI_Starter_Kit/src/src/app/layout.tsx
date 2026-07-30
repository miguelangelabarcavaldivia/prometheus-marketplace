import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { Header } from "@/components/Header";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: {
    default: "NextJS AI Starter Kit",
    template: "%s | NextJS AI Starter Kit",
  },
  description:
    "A production-ready AI chat application built with Next.js 15, featuring multi-model support, Stripe subscriptions, and authentication.",
  keywords: ["AI", "Chat", "Next.js", "OpenAI", "GPT", "Starter Kit"],
  openGraph: {
    title: "NextJS AI Starter Kit",
    description:
      "Production-ready AI chat with multi-model support, subscriptions, and more.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="min-h-screen bg-surface-50 font-sans text-surface-900">
        <Providers>
          <Header />
          <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
