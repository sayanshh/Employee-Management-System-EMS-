import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/auth-context';

export const metadata: Metadata = {
  title: 'EMS Core - Modern Employee Management System',
  description: 'Clean, high-contrast Employee Management System with Next.js, Supabase & TypeScript',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#09090b] text-zinc-100 antialiased selection:bg-purple-500/30 selection:text-purple-200">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}

