// Lokasi: app/kontak/page.tsx

'use client';

import { useState } from 'react';

export default function KontakPage() {
  const [formData, setFormData] = useState({
    nama: '',
    email: '',
    telepon: '',
    pesan: ''
  });
  const [submitted, setSubmitted] = useState(false);

  // Link Google Maps yang akurat
  const googleMapsLink = "https://maps.app.goo.gl/4XubE8Xa94614m1V8";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Send to API
    console.log('Form submitted:', formData);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ nama: '', email: '', telepon: '', pesan: '' });
    }, 3000);
  };

  return (
    <div style={styles.container}>
      <div style={styles.hero}>
        <h1 style={styles.heroTitle}>Hubungi Kami</h1>
        <p style={styles.heroSubtitle}>
          Punya pertanyaan? Kami siap membantu Anda!
        </p>
      </div>

      <div style={styles.content}>
        <div style={styles.grid}>
          <div style={styles.infoSection}>
            <h2 style={styles.infoTitle}>Informasi Kontak</h2>
            
            <div style={styles.contactCard}>
              <div style={styles.contactIcon}>📍</div>
              <div>
                <h3 style={styles.contactLabel}>Alamat</h3>
                <p style={styles.contactText}>
                  Jl. Lap. Golf, Kp. Tengah<br />
                  Kec. Pancur Batu<br />
                  Kabupaten Deli Serdang<br />
                  Sumatera Utara, Indonesia
                </p>
              </div>
            </div>

            <div style={styles.contactCard}>
              <div style={styles.contactIcon}>📞</div>
              <div>
                <h3 style={styles.contactLabel}>Telepon</h3>
                <p style={styles.contactText}>
                  +62 838-7851-5387<br />
                  WhatsApp: 0838-7851-5387
                </p>
              </div>
            </div>

            <div style={styles.contactCard}>
              <div style={styles.contactIcon}>✉️</div>
              <div>
                <h3 style={styles.contactLabel}>Email</h3>
                <p style={styles.contactText}>
                  info@kostqonitaat.com<br />
                  admin@kostqonitaat.com
                </p>
              </div>
            </div>

            <div style={styles.contactCard}>
              <div style={styles.contactIcon}>🕐</div>
              <div>
                <h3 style={styles.contactLabel}>Jam Operasional</h3>
                <p style={styles.contactText}>
                  Senin - Jumat: 08.00 - 20.00 WIB<br />
                  Sabtu - Minggu: 09.00 - 17.00 WIB
                </p>
              </div>
            </div>

            <div style={styles.socialSection}>
              <h3 style={styles.socialTitle}>Ikuti Kami</h3>
              <div style={styles.socialLinks}>
                <a href="#" style={styles.socialButton}>📘 Facebook</a>
                <a href="#" style={styles.socialButton}>📷 Instagram</a>
                <a 
                  href="https://api.whatsapp.com/send?phone=6283878515387&text=Halo,%20saya%20tertarik%20dengan%20Kost%20Pondok%20Qonitaat" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  style={styles.socialButton}
                >
                  💬 WhatsApp
                </a>
              </div>
            </div>
          </div>

          <div style={styles.formSection}>
            <h2 style={styles.formTitle}>Kirim Pesan</h2>
            
            {submitted && (
              <div style={styles.successMessage}>
                ✓ Pesan berhasil dikirim! Kami akan segera menghubungi Anda.
              </div>
            )}

            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Nama Lengkap *</label>
                <input
                  type="text"
                  name="nama"
                  value={formData.nama}
                  onChange={handleChange}
                  required
                  style={styles.input}
                  placeholder="Masukkan nama lengkap Anda"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  style={styles.input}
                  placeholder="nama@email.com"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Nomor Telepon *</label>
                <input
                  type="tel"
                  name="telepon"
                  value={formData.telepon}
                  onChange={handleChange}
                  required
                  style={styles.input}
                  placeholder="08xx-xxxx-xxxx"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Pesan *</label>
                <textarea
                  name="pesan"
                  value={formData.pesan}
                  onChange={handleChange}
                  required
                  rows={6}
                  style={styles.textarea}
                  placeholder="Tuliskan pertanyaan atau pesan Anda di sini..."
                />
              </div>

              <button type="submit" style={styles.submitButton}>
                📤 Kirim Pesan
              </button>
            </form>
          </div>
        </div>

        {/* SECTION GOOGLE MAPS - UPGRADED */}
        <div style={styles.mapSection}>
          <h2 style={styles.mapTitle}>📍 Lokasi Kami</h2>
          
          <div style={styles.mapContainer}>
            {/* Grid 2 Kolom: Info Alamat & Peta */}
            <div style={styles.mapGrid}>
              {/* Kolom Kiri: Info & Tombol */}
              <div style={styles.mapInfoBox}>
                <div style={styles.mapIconLarge}>🗺️</div>
                <h3 style={styles.mapInfoTitle}>Alamat Lengkap</h3>
                <div style={styles.addressBox}>
                  <p style={styles.addressText}>
                    Jl. Lap. Golf, Kp. Tengah<br />
                    Kec. Pancur Batu<br />
                    Kabupaten Deli Serdang<br />
                    Sumatera Utara
                  </p>
                </div>

                {/* Tombol Google Maps */}
                <div style={styles.mapButtons}>
                  <a
                    href={googleMapsLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={styles.mapButtonPrimary}
                  >
                    🧭 Buka di Google Maps
                  </a>
                  <a
                    href={googleMapsLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={styles.mapButtonSecondary}
                  >
                    🚗 Dapatkan Petunjuk Arah
                  </a>
                </div>

                <p style={styles.mapHint}>
                  💡 Klik tombol untuk navigasi langsung
                </p>
              </div>

              {/* Kolom Kanan: Iframe Peta */}
              <div style={styles.mapIframeContainer}>
                <iframe
                  src="https://www.google.com/maps?q=Jl.+Lap.+Golf,+Kp.+Tengah,+Pancur+Batu,+Deli+Serdang,+Sumatera+Utara&output=embed"
                  width="100%"
                  height="100%"
                  style={styles.mapIframe}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Lokasi Kost Pondok Qonitaat di Google Maps"
                />
              </div>
            </div>
          </div>
        </div>
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
  },
  content: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '3rem 2rem',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
    gap: '3rem',
    marginBottom: '3rem',
  },
  infoSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  infoTitle: {
    fontSize: '1.75rem',
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: '1rem',
  },
  contactCard: {
    display: 'flex',
    gap: '1.5rem',
    padding: '1.5rem',
    background: 'white',
    borderRadius: '12px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
  },
  contactIcon: {
    fontSize: '2.5rem',
  },
  contactLabel: {
    fontSize: '1.1rem',
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: '0.5rem',
  },
  contactText: {
    fontSize: '0.95rem',
    color: '#64748b',
    lineHeight: 1.6,
  },
  socialSection: {
    padding: '1.5rem',
    background: 'white',
    borderRadius: '12px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
  },
  socialTitle: {
    fontSize: '1.1rem',
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: '1rem',
  },
  socialLinks: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  socialButton: {
    padding: '0.75rem',
    background: '#f1f5f9',
    color: '#334155',
    textDecoration: 'none',
    borderRadius: '8px',
    textAlign: 'center',
    fontSize: '0.95rem',
    fontWeight: 600,
    transition: 'background 0.3s',
  },
  formSection: {
    background: 'white',
    padding: '2.5rem',
    borderRadius: '15px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.07)',
  },
  formTitle: {
    fontSize: '1.75rem',
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: '1.5rem',
  },
  successMessage: {
    padding: '1rem',
    background: '#d1fae5',
    color: '#065f46',
    borderRadius: '8px',
    marginBottom: '1.5rem',
    fontSize: '0.95rem',
    fontWeight: 600,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  label: {
    fontSize: '0.95rem',
    fontWeight: 600,
    color: '#334155',
  },
  input: {
    padding: '0.875rem',
    border: '2px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '1rem',
    transition: 'border-color 0.3s',
  },
  textarea: {
    padding: '0.875rem',
    border: '2px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '1rem',
    resize: 'vertical',
    fontFamily: 'inherit',
  },
  submitButton: {
    padding: '1rem',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '1.1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'transform 0.3s',
  },
  
  // STYLES UNTUK GOOGLE MAPS - BARU
  mapSection: {
    marginTop: '3rem',
  },
  mapTitle: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: '2rem',
    textAlign: 'center',
  },
  mapContainer: {
    background: 'white',
    borderRadius: '20px',
    padding: '2.5rem',
    boxShadow: '0 4px 6px rgba(0,0,0,0.07)',
  },
  mapGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
    gap: '2.5rem',
  },
  mapInfoBox: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  mapIconLarge: {
    fontSize: '4rem',
    textAlign: 'center',
  },
  mapInfoTitle: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#1e293b',
    textAlign: 'center',
  },
  addressBox: {
    background: '#f8f4ff',
    borderLeft: '4px solid #667eea',
    padding: '1.5rem',
    borderRadius: '10px',
  },
  addressText: {
    fontSize: '1.05rem',
    color: '#334155',
    lineHeight: 1.7,
    margin: 0,
  },
  mapButtons: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  mapButtonPrimary: {
    padding: '1rem',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    textDecoration: 'none',
    textAlign: 'center',
    borderRadius: '50px',
    fontSize: '1rem',
    fontWeight: 'bold',
    transition: 'transform 0.3s, box-shadow 0.3s',
    cursor: 'pointer',
  },
  mapButtonSecondary: {
    padding: '1rem',
    background: 'white',
    color: '#667eea',
    textDecoration: 'none',
    textAlign: 'center',
    borderRadius: '50px',
    fontSize: '1rem',
    fontWeight: 'bold',
    border: '2px solid #667eea',
    transition: 'all 0.3s',
    cursor: 'pointer',
  },
  mapHint: {
    textAlign: 'center',
    fontSize: '0.9rem',
    color: '#64748b',
    margin: 0,
  },
  mapIframeContainer: {
    background: '#f1f5f9',
    borderRadius: '15px',
    overflow: 'hidden',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    minHeight: '450px',
  },
  mapIframe: {
    border: 0,
    minHeight: '450px',
    display: 'block',
  },
};