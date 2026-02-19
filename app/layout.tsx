import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'DeepScribe Clinical Trials Matcher',
  description: 'Extract patient data from transcripts and find relevant clinical trials.',
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
