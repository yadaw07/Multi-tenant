import type { Metadata } from 'next';
import { Inter, Geist } from 'next/font/google';

import { ClerkProvider } from '@clerk/nextjs';

import { cn } from '@/lib/utils';
import { syncUserToDatabase } from '@/lib/sync-user';

import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';

import './globals.css';

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' });

const inter = Inter({
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'DocuAI',
  description:
    'AI-Powered Document Analysis Platform. Multi-tenant SaaS for Teams & Organizations',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Sync user info to database from clerk
  await syncUserToDatabase();

  return (
    <html lang='en' className={cn('font-sans', geist.variable)}>
      <body className={inter.className}>
        <ClerkProvider>
          <div className='min-h-screen flex flex-col'>
            {/* Header */}
            <Header />

            {/* Main */}
            <main className='flex-1'>{children}</main>

            {/* Footer */}
            <Footer />
          </div>
        </ClerkProvider>
      </body>
    </html>
  );
}
