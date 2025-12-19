'use client';

import { useState, useEffect } from 'react';

export default function HomePage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div style={styles.container}>
      {/* Hero Section */}
      <section style={styles.heroSection}>
        <div style={{
          ...styles.heroContent,
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(30px)',
          transition: 'all 1s ease-out',
        }}>
          <h1 style={styles.heroTitle}>
            Selamat Datang di Kost Pondok Qonitaat
          </h1>
          <p style={styles.heroSubtitle}>
            Hunian nyaman dan aman di Medan dengan fasilitas lengkap untuk kenyamanan Anda
          </p>
          <div style={styles.heroButtons}>
            <a 
              href="/login" 
              style={styles.btnPrimary}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px) scale(1.05)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)';
              }}
            >
              Login untuk Booking
            </a>
            <a 
              href="/register" 
              style={styles.btnSecondary}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px) scale(1.05)';
                e.currentTarget.style.background = 'white';
                e.currentTarget.style.color = '#667eea';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = 'white';
              }}
            >
              Daftar Sekarang
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section style={styles.featuresSection}>
        <h2 style={{
          ...styles.sectionTitle,
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(30px)',
          transition: 'all 1s ease-out 0.3s',
        }}>
          Kenapa Memilih Kami?
        </h2>
        <div style={styles.featuresGrid}>
          {[
            {
              icon: '🏠',
              title: 'Lokasi Strategis',
              text: 'Terletak di pusat kota Medan dengan akses mudah ke berbagai fasilitas umum',
              delay: '0.4s'
            },
            {
              icon: '🔒',
              title: 'Aman & Nyaman',
              text: 'Sistem keamanan 24 jam dengan CCTV dan penjaga yang siap membantu',
              delay: '0.6s'
            },
            {
              icon: '✨',
              title: 'Fasilitas Lengkap',
              text: 'Kamar mandi dalam, AC, Wi-Fi, kasur, lemari, dan fasilitas lainnya',
              delay: '0.8s'
            },
            {
              icon: '💰',
              title: 'Harga Terjangkau',
              text: 'Berbagai pilihan kelas kost dengan harga yang sesuai budget Anda',
              delay: '1s'
            }
          ].map((feature, index) => (
            <div 
              key={index}
              style={{
                ...styles.featureCard,
                opacity: mounted ? 1 : 0,
                transform: mounted ? 'translateY(0)' : 'translateY(30px)',
                transition: `all 1s ease-out ${feature.delay}`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-10px)';
                e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.1)';
              }}
            >
              <div style={styles.featureIcon}>{feature.icon}</div>
              <h3 style={styles.featureTitle}>{feature.title}</h3>
              <p style={styles.featureText}>{feature.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section style={styles.ctaSection}>
        <div style={{
          ...styles.ctaContent,
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'scale(1)' : 'scale(0.95)',
          transition: 'all 1s ease-out 1.2s',
        }}>
          <h2 style={styles.ctaTitle}>Siap Menemukan Kost Impian Anda?</h2>
          <p style={styles.ctaText}>
            Login sekarang untuk melihat daftar kost yang tersedia dan lakukan booking
          </p>
          <a 
            href="/login" 
            style={styles.ctaButton}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-5px) scale(1.05)';
              e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.2)';
            }}
          >
            Login Sekarang
          </a>
        </div>
      </section>

      {/* Info Section */}
      <section style={styles.infoSection}>
        <div style={styles.infoGrid}>
          {[
            { icon: '📍', title: 'Lokasi', text: 'Medan, Sumatera Utara', delay: '1.4s' },
            { icon: '📞', title: 'Kontak', text: '0838-7851-5387', delay: '1.6s' },
            { icon: '✉️', title: 'Email', text: 'info@pondokqonitaat.com', delay: '1.8s' }
          ].map((info, index) => (
            <div 
              key={index}
              style={{
                ...styles.infoCard,
                opacity: mounted ? 1 : 0,
                transform: mounted ? 'translateY(0)' : 'translateY(20px)',
                transition: `all 1s ease-out ${info.delay}`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <h3 style={styles.infoTitle}>{info.icon} {info.title}</h3>
              <p style={styles.infoText}>{info.text}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: '100vh',
  },
  
  // Hero Section
  heroSection: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '6rem 2rem',
    textAlign: 'center',
    color: 'white',
  },
  heroContent: {
    maxWidth: '800px',
    margin: '0 auto',
  },
  heroTitle: {
    fontSize: '3rem',
    fontWeight: 'bold',
    marginBottom: '1.5rem',
    lineHeight: 1.2,
  },
  heroSubtitle: {
    fontSize: '1.25rem',
    marginBottom: '2.5rem',
    opacity: 0.95,
    lineHeight: 1.6,
  },
  heroButtons: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  btnPrimary: {
    padding: '1rem 2.5rem',
    background: 'white',
    color: '#667eea',
    textDecoration: 'none',
    borderRadius: '12px',
    fontSize: '1.1rem',
    fontWeight: 'bold',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
    cursor: 'pointer',
  },
  btnSecondary: {
    padding: '1rem 2.5rem',
    background: 'transparent',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '12px',
    fontSize: '1.1rem',
    fontWeight: 'bold',
    border: '2px solid white',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
  },
  
  // Features Section
  featuresSection: {
    padding: '5rem 2rem',
    background: '#f9fafb',
  },
  sectionTitle: {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: '3rem',
    color: '#333',
  },
  featuresGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '2rem',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  featureCard: {
    background: 'white',
    padding: '2rem',
    borderRadius: '15px',
    textAlign: 'center',
    boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
  },
  featureIcon: {
    fontSize: '3rem',
    marginBottom: '1rem',
  },
  featureTitle: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    marginBottom: '1rem',
    color: '#333',
  },
  featureText: {
    fontSize: '1rem',
    color: '#666',
    lineHeight: 1.6,
  },
  
  // CTA Section
  ctaSection: {
    background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
    padding: '5rem 2rem',
    textAlign: 'center',
  },
  ctaContent: {
    maxWidth: '700px',
    margin: '0 auto',
  },
  ctaTitle: {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    color: 'white',
    marginBottom: '1.5rem',
  },
  ctaText: {
    fontSize: '1.25rem',
    color: 'white',
    marginBottom: '2rem',
    opacity: 0.95,
  },
  ctaButton: {
    display: 'inline-block',
    padding: '1rem 3rem',
    background: 'white',
    color: '#f97316',
    textDecoration: 'none',
    borderRadius: '12px',
    fontSize: '1.2rem',
    fontWeight: 'bold',
    boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
  },
  
  // Info Section
  infoSection: {
    padding: '4rem 2rem',
    background: 'white',
  },
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '2rem',
    maxWidth: '1000px',
    margin: '0 auto',
  },
  infoCard: {
    textAlign: 'center',
    padding: '1.5rem',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
  },
  infoTitle: {
    fontSize: '1.5rem',
    marginBottom: '0.5rem',
    color: '#333',
  },
  infoText: {
    fontSize: '1rem',
    color: '#666',
  },
};