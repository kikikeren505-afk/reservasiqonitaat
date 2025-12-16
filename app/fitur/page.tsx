    'use client';

export default function FiturPage() {
  const fiturList = [
    {
      icon: '🛏️',
      title: 'Kamar Nyaman',
      description: 'Kamar dengan desain modern dan furniture lengkap untuk kenyamanan Anda'
    },
    {
      icon: '🌐',
      title: 'WiFi Cepat',
      description: 'Koneksi internet berkecepatan tinggi 24/7 untuk kebutuhan online Anda'
    },
    {
      icon: '❄️',
      title: 'AC & Kipas',
      description: 'Pendingin ruangan untuk kenyamanan tidur di segala cuaca'
    },
    {
      icon: '🚿',
      title: 'Kamar Mandi Dalam',
      description: 'Kamar mandi pribadi dengan water heater dan perlengkapan mandi'
    },
    {
      icon: '🔒',
      title: 'Keamanan 24 Jam',
      description: 'Sistem keamanan CCTV dan security yang siaga setiap saat'
    },
    {
      icon: '🚗',
      title: 'Parkir Luas',
      description: 'Area parkir yang aman dan luas untuk motor dan mobil'
    },
    {
      icon: '🍳',
      title: 'Dapur Bersama',
      description: 'Dapur dengan peralatan lengkap yang bisa digunakan bersama'
    },
    {
      icon: '🧺',
      title: 'Laundry',
      description: 'Layanan laundry dengan harga terjangkau untuk kemudahan Anda'
    },
    {
      icon: '📺',
      title: 'Ruang Bersama',
      description: 'Area berkumpul dengan TV dan tempat duduk yang nyaman'
    },
    {
      icon: '🏪',
      title: 'Dekat Fasilitas Umum',
      description: 'Lokasi strategis dekat minimarket, rumah sakit, dan kampus'
    },
    {
      icon: '💡',
      title: 'Listrik & Air',
      description: 'Listrik dan air sudah termasuk dalam harga sewa bulanan'
    },
    {
      icon: '🧹',
      title: 'Cleaning Service',
      description: 'Layanan kebersihan area umum setiap hari'
    }
  ];

  const fasilitasTambahan = [
    'Kasur spring bed berkualitas',
    'Lemari pakaian 2 pintu',
    'Meja belajar & kursi',
    'Rak buku dan cermin',
    'Gantungan baju',
    'Tempat sampah',
    'Shower dan closet duduk'
  ];

  return (
    <div style={styles.container}>
      <div style={styles.hero}>
        <h1 style={styles.heroTitle}>Fasilitas & Fitur Unggulan</h1>
        <p style={styles.heroSubtitle}>
          Kost Pondok Qonitaat menyediakan berbagai fasilitas modern untuk kenyamanan hunian Anda
        </p>
      </div>

      <div style={styles.content}>
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Fasilitas Utama</h2>
          <div style={styles.fiturGrid}>
            {fiturList.map((fitur, index) => (
              <div key={index} style={styles.fiturCard}>
                <div style={styles.iconWrapper}>
                  <span style={styles.icon}>{fitur.icon}</span>
                </div>
                <h3 style={styles.fiturTitle}>{fitur.title}</h3>
                <p style={styles.fiturDesc}>{fitur.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Perlengkapan Kamar</h2>
          <div style={styles.fasilitasBox}>
            <div style={styles.fasilitasList}>
              {fasilitasTambahan.map((item, index) => (
                <div key={index} style={styles.fasilitasItem}>
                  <span style={styles.checkIcon}>✓</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section style={styles.ctaSection}>
          <h2 style={styles.ctaTitle}>Tertarik dengan Fasilitasnya?</h2>
          <p style={styles.ctaText}>
            Segera reservasi kamar impian Anda dan nikmati semua fasilitas yang kami sediakan
          </p>
          <div style={styles.ctaButtons}>
            <a href="/kost" style={styles.btnPrimary}>
              Lihat Daftar Kost
            </a>
            <a href="/kontak" style={styles.btnSecondary}>
              Hubungi Kami
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: '100vh',
    background: '#f8fafc',
  },
  hero: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    padding: '4rem 2rem',
    textAlign: 'center',
  },
  heroTitle: {
    fontSize: '3rem',
    fontWeight: 'bold',
    marginBottom: '1rem',
  },
  heroSubtitle: {
    fontSize: '1.25rem',
    opacity: 0.95,
    maxWidth: '800px',
    margin: '0 auto',
  },
  content: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '3rem 2rem',
  },
  section: {
    marginBottom: '4rem',
  },
  sectionTitle: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: '2rem',
    textAlign: 'center',
  },
  fiturGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '2rem',
  },
  fiturCard: {
    background: 'white',
    padding: '2rem',
    borderRadius: '15px',
    textAlign: 'center',
    boxShadow: '0 4px 6px rgba(0,0,0,0.07)',
    transition: 'transform 0.3s, box-shadow 0.3s',
    cursor: 'pointer',
  },
  iconWrapper: {
    marginBottom: '1rem',
  },
  icon: {
    fontSize: '3rem',
  },
  fiturTitle: {
    fontSize: '1.25rem',
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: '0.75rem',
  },
  fiturDesc: {
    fontSize: '0.95rem',
    color: '#64748b',
    lineHeight: 1.6,
  },
  fasilitasBox: {
    background: 'white',
    padding: '2.5rem',
    borderRadius: '15px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.07)',
  },
  fasilitasList: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: '1.5rem',
  },
  fasilitasItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    fontSize: '1rem',
    color: '#334155',
  },
  checkIcon: {
    color: '#10b981',
    fontSize: '1.5rem',
    fontWeight: 'bold',
  },
  ctaSection: {
    background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
    padding: '3rem',
    borderRadius: '20px',
    textAlign: 'center',
    color: 'white',
  },
  ctaTitle: {
    fontSize: '2rem',
    fontWeight: 'bold',
    marginBottom: '1rem',
  },
  ctaText: {
    fontSize: '1.1rem',
    marginBottom: '2rem',
    opacity: 0.95,
  },
  ctaButtons: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  btnPrimary: {
    padding: '1rem 2.5rem',
    background: 'white',
    color: '#f97316',
    textDecoration: 'none',
    borderRadius: '10px',
    fontSize: '1.1rem',
    fontWeight: 'bold',
    transition: 'transform 0.3s',
  },
  btnSecondary: {
    padding: '1rem 2.5rem',
    background: 'transparent',
    color: 'white',
    textDecoration: 'none',
    border: '2px solid white',
    borderRadius: '10px',
    fontSize: '1.1rem',
    fontWeight: 'bold',
    transition: 'transform 0.3s',
  },
};