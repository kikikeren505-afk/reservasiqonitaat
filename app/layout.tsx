'use client';

import { usePathname } from 'next/navigation';
import "./globals.css";
import Header from "./components/Header";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  
  // Sembunyikan footer di halaman dashboard dan admin
  const isDashboardPage = pathname?.startsWith('/dashboard') || pathname?.startsWith('/admin');

  return (
    <html lang="id">
      <head>
        <title>Kost Pondok Qonitaat - Hunian Nyaman di Medan</title>
        <meta name="description" content="Sistem reservasi kost Pondok Qonitaat - Hunian nyaman, aman, dan terpercaya di Medan" />
        <meta name="keywords" content="kost, kost medan, pondok qonitaat, reservasi kost, hunian medan" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>
        <Header />
        <main>{children}</main>
        {!isDashboardPage && <Footer />}
      </body>
    </html>
  );
}

function Footer() {
  return (
    <footer style={{
      background: '#1f2937',
      color: 'white',
      padding: '3rem 2rem',
      marginTop: '4rem'
    }}>
      <div className="container">
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '2rem',
          marginBottom: '2rem'
        }}>
          <div>
            <h3 style={{ marginBottom: '1rem' }}>Kost Pondok Qonitaat</h3>
            <p style={{ color: '#9ca3af', lineHeight: '1.6' }}>
              Hunian nyaman dan aman di Medan dengan fasilitas lengkap untuk kenyamanan Anda.
            </p>
          </div>
          <div>
            <h4 style={{ marginBottom: '1rem' }}>Menu</h4>
            <ul style={{ listStyle: 'none', color: '#9ca3af' }}>
              <li style={{ marginBottom: '0.5rem' }}><a href="/" style={{ color: 'inherit', textDecoration: 'none' }}>Beranda</a></li>
              <li style={{ marginBottom: '0.5rem' }}><a href="/kost" style={{ color: 'inherit', textDecoration: 'none' }}>Cari Kost</a></li>
              <li style={{ marginBottom: '0.5rem' }}><a href="/fitur" style={{ color: 'inherit', textDecoration: 'none' }}>Fitur</a></li>
              <li style={{ marginBottom: '0.5rem' }}><a href="/kontak" style={{ color: 'inherit', textDecoration: 'none' }}>Kontak</a></li>
            </ul>
          </div>
          <div>
            <h4 style={{ marginBottom: '1rem' }}>Kontak</h4>
            <ul style={{ listStyle: 'none', color: '#9ca3af' }}>
              <li style={{ marginBottom: '0.5rem' }}>📍 Medan, Sumatera Utara</li>
              <li style={{ marginBottom: '0.5rem' }}>📞 +62 xxx xxxx xxxx</li>
              <li style={{ marginBottom: '0.5rem' }}>✉️ info@pondokqonitaat.com</li>
            </ul>
          </div>
        </div>
        <div style={{ 
          borderTop: '1px solid #374151', 
          paddingTop: '2rem',
          textAlign: 'center',
          color: '#9ca3af'
        }}>
          <p>&copy; 2025 Kost Pondok Qonitaat. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}