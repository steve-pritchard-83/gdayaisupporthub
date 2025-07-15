import './globals.css';
import Layout from '@/components/Layout';
import { ThemeProvider } from '@/utils/themeContext';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "G'day AI Support Hub",
  description: 'Modern ticketing system for managing staff support requests related to AI tool access',
  keywords: ['support', 'tickets', 'AI', 'help desk', 'gday group'],
  icons: {
    icon: '/apple-touch-icon.png',
    apple: '/apple-touch-icon.png',
    shortcut: '/apple-touch-icon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="dark">
      <body>
        <ThemeProvider>
          <Layout>{children}</Layout>
        </ThemeProvider>
      </body>
    </html>
  );
} 