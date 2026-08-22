import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import { QueryProvider } from '@hektor/query';
import { TooltipProvider } from '@hektor/ui/atoms';
import { ThemeProvider } from '@hektor/ui/context';

import { NextNavigationProvider } from '@/lib/navigation/NextNavigationProvider';

import './styles.css';

export const metadata: Metadata = {
  title: 'Hektor',
  description: 'Hektor web application',
  manifest: '/manifest.webmanifest',
  icons: {
    icon: '/favicon.svg',
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <NextNavigationProvider>
            <QueryProvider>
              <TooltipProvider>{children}</TooltipProvider>
            </QueryProvider>
          </NextNavigationProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
