import './globals.css';

/**
 * Minimal root layout. Locale-specific layout and metadata live in [locale]/layout.tsx.
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
