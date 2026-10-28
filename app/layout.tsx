import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'GigPilot AI',
  description: 'A thoughtful workspace for freelance opportunities',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      {/* Browser extensions can add attributes to body before hydration. */}
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
