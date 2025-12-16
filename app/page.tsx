export default function HomePage() {
  return (
    <div style={styles.container}>
      {/* Hero Section */}
      <section style={styles.heroSection}>
        <div style={styles.heroContent}>
          <h1 style={styles.heroTitle}>
            Selamat Datang di Kost Pondok Qonitaat
          </h1>
          <p style={styles.heroSubtitle}>
            Hunian nyaman dan aman di Medan dengan fasilitas lengkap untuk kenyamanan Anda
          </p>
          <div style={styles.heroButtons}>
            <a href="/login" style={styles.btnPrimary}>
              Login untuk Booking
            </a>
            <a href="/register" style={styles.btnSecondary}>
              Daftar Sekarang
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section style={styles.featuresSection}>
        <h2 style={styles.sectionTitle}>Kenapa Memilih Kami?</h2>
        <div style={styles.featuresGrid}>
          <div style={styles.featureCard}>
            <div style={styles.featureIcon}>🏠</div>
            <h3 style={styles.featureTitle}>Lokasi Strategis</h3>
            <p style={styles.featureText}>
              Terletak di pusat kota Medan dengan akses mudah ke berbagai fasilitas umum
            </p>
          </div>
          
          <div style={styles.featureCard}>
            <div style={styles.featureIcon}>🔒</div>
            <h3 style={styles.featureTitle}>Aman & Nyaman</h3>
            <p style={styles.featureText}>
              Sistem keamanan 24 jam dengan CCTV dan penjaga yang siap membantu
            </p>
          </div>
          
          <div style={styles.featureCard}>
            <div style={styles.featureIcon}>✨</div>
            <h3 style={styles.featureTitle}>Fasilitas Lengkap</h3>
            <p style={styles.featureText}>
              Kamar mandi dalam, AC, Wi-Fi, kasur, lemari, dan fasilitas lainnya
            </p>
          </div>
          
          <div style={styles.featureCard}>
            <div style={styles.featureIcon}>💰</div>
            <h3 style={styles.featureTitle}>Harga Terjangkau</h3>
            <p style={styles.featureText}>
              Berbagai pilihan kelas kost dengan harga yang sesuai budget Anda
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={styles.ctaSection}>
        <div style={styles.ctaContent}>
          <h2 style={styles.ctaTitle}>Siap Menemukan Kost Impian Anda?</h2>
          <p style={styles.ctaText}>
            Login sekarang untuk melihat daftar kost yang tersedia dan lakukan booking
          </p>
          <a href="/login" style={styles.ctaButton}>
            Login Sekarang
          </a>
        </div>
      </section>

      {/* Info Section */}
      <section style={styles.infoSection}>
        <div style={styles.infoGrid}>
          <div style={styles.infoCard}>
            <h3 style={styles.infoTitle}>📍 Lokasi</h3>
            <p style={styles.infoText}>Medan, Sumatera Utara</p>
          </div>
          
          <div style={styles.infoCard}>
            <h3 style={styles.infoTitle}>📞 Kontak</h3>
            <p style={styles.infoText}>+62 xxx xxxx xxxx</p>
          </div>
          
          <div style={styles.infoCard}>
            <h3 style={styles.infoTitle}>✉️ Email</h3>
            <p style={styles.infoText}>info@pondokqonitaat.com</p>
          </div>
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
    transition: 'all 0.3s',
    boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
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
    transition: 'all 0.3s',
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
    transition: 'transform 0.3s',
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
    transition: 'all 0.3s',
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