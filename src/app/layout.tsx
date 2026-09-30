import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ग्राम पंचायत पोर्टल | Gram Panchayat Portal',
  description: 'Submit your complaints and issues directly to the Sarpanch.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="hi">
      <body>
        <main>{children}</main>
      </body>
    </html>
  ); 
}
