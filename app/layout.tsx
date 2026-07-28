import type { Metadata } from 'next';
import { Inter, Geist } from 'next/font/google';

import { ClerkProvider } from '@clerk/nextjs';

import './globals.css';
import { cn } from '@/lib/utils';

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' });

const inter = Inter({
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'DocuAI-Multi-tenant SaaS App',
  description:
    'AI-Powered Document Analysis Platform. Multi-tenant SaaS for Teams & Organizations',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang='en' className={cn('font-sans', geist.variable)}>
        <body className={inter.className}>
          <div className='min-h-screen flex flex-col'>
            {/* Header */}

            {/* Main */}
            <main className='flex-1'>{children}</main>

            {/* Footer */}
          </div>
        </body>
      </html>
    </ClerkProvider>
  );
}
