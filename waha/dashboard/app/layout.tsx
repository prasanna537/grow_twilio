import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/lib/providers";
import { AppShell } from "@/components/layout/AppShell";

export const metadata: Metadata = {
  title: "wahub — WhatsApp API Console",
  description:
    "Operate WhatsApp sessions, messages, webhooks, and API keys from one clear console. Production-grade WAHA dashboard.",
  keywords: ["WhatsApp", "WAHA", "API", "Dashboard", "Messaging"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
