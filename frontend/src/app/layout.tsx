import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'sonner';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'grow_twilio - Gym WhatsApp Renewal Dashboard',
  description: 'Multi-provider WhatsApp automated membership renewal dashboard',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} min-h-full bg-slate-50 text-slate-900 antialiased dark:bg-slate-950 dark:text-slate-50`}>
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
