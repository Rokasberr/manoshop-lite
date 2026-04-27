import type { Metadata } from "next";
import { Manrope, Space_Grotesk } from "next/font/google";
import { AuthSessionProvider } from "@/components/providers/session-provider";
import { SiteFooter } from "@/components/site/footer";
import { SiteHeader } from "@/components/site/header";
import "./globals.css";

const bodyFont = Manrope({
  subsets: ["latin"],
  variable: "--font-body",
});

const headingFont = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-heading",
});

export const metadata: Metadata = {
  title: "AI Sales Copilot SaaS",
  description: "Lead follow-up, AI email generation, CRM pipeline, and Stripe billing in one SaaS MVP.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${bodyFont.variable} ${headingFont.variable} bg-slate-50 font-body text-slate-900`}>
        <AuthSessionProvider>
          <div className="min-h-screen">
            <SiteHeader />
            {children}
            <SiteFooter />
          </div>
        </AuthSessionProvider>
      </body>
    </html>
  );
}
