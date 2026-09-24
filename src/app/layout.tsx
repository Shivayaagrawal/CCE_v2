import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CCE Decision Assurance Dashboard',
  description: 'CCE Decision Assurance Dashboard',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
