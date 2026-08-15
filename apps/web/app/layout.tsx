import type { Metadata } from 'next';
import { DM_Sans } from 'next/font/google';
import type { ReactNode } from 'react';

import { QueryProvider } from '@hektor/query';
import { TooltipProvider } from '@hektor/ui/atoms';
import { ThemeProvider } from '@hektor/ui/context';

import './styles.css';

const titleFont = DM_Sans({
  display: 'swap',
  subsets: ['latin'],
  variable: '--hektor-google-title-font',
});

export const metadata: Metadata = {
  title: 'Hektor',
  description: 'Hektor web application',
};

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html className={titleFont.variable} lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <QueryProvider>
            <TooltipProvider>{children}</TooltipProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
