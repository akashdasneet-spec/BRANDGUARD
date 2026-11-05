import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'BrandGuard — AI-Powered Brand Governance',
  description: 'Automated brand compliance analysis with AI-powered findings and evidence-backed corrections',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background font-sans antialiased">{children}</body>
    </html>
  );
}
