// Lokasi: app/kontak/page.tsx

'use client';

import { useState, useEffect } from 'react';

export default function KontakPage() {
  const [mounted, setMounted] = useState(false);
  const [formData, setFormData] = useState({
    nama: '',
    email: '',
    telepon: '',
    pesan: ''
  });
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
      <div style={{
        ...styles.hero,
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'translateY(0)' : 'translateY(-30px)',
        transition: 'all 1s ease-out',
      }}>
        <h1 style={styles.heroTitle}>Hubungi Kami</h1>
        <p style={styles.heroSubtitle}>
          Punya pertanyaan? Kami siap membantu Anda!
        </p>
      </div>

      <div style={styles.content}>
        <div style={styles.grid}>
          <div style={{
            ...styles.infoSection,
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateX(0)' : 'translateX(-30px)',
            transition: 'all 0.8s ease-out 0.3s',
          }}>
            <h2 style={styles.infoTitle}>Informasi Kontak</h2>
            
            {[
              {
                icon: '📍',
                label: 'Alamat',
                text: (
                  <>
                    Jl. Lap. Golf, Kp. Tengah<br />
                    Kec. Pancur Batu<br />
                    Kabupaten Deli Serdang<br />
                    Sumatera Utara, Indonesia
                  </>
                ),
                delay: '0.5s'
              },
              {
                icon: '📞',
                label: 'Telepon',
                text: (
                  <>
                    +62 838-7851-5387<br />
                    WhatsApp: 0838-7851-5387
                  </>
                ),
                delay: '0.7s'
              },
              {
                icon: '✉️',
                label: 'Email',
                text: (
                  <>
                    info@kostqonitaat.com<br />
                    admin@kostqonitaat.com
                  </>
                ),
                delay: '0.9s'
              },
              {
                icon: '🕐',
                label: 'Jam Operasional',
                text: (
                  <>
                    Senin - Jumat: 08.00 - 20.00 WIB<br />
                    Sabtu - Minggu: 09.00 - 17.00 WIB
                  </>
                ),
                delay: '1.1s'
              }
            ].map((contact, index) => (
              <div 
                key={index}
                style={{
                  ...styles.contactCard,
                  opacity: mounted ? 1 : 0,
                  transform: mounted ? 'translateY(0)' : 'translateY(20px)',
                  transition: `all 0.6s ease-out ${contact.delay}`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)';
                }}
              >
                <div style={styles.contactIcon}>{contact.icon}</div>
                <div>
                  <h3 style={styles.contactLabel}>{contact.label}</h3>
                  <p style={styles.contactText}>{contact.text}</p>
                </div>
              </div>
            ))}

            <div style={{
              ...styles.socialSection,
              opacity: mounted ? 1 : 0,
              transform: mounted ? 'scale(1)' : 'scale(0.95)',
              transition: 'all 0.6s ease-out 1.3s',
            }}>
              <h3 style={styles.socialTitle}>Ikuti Kami</h3>
              <div style={styles.socialLinks}>
                {[
                  { icon: '📘', text: 'Facebook', href: '#' },
                  { icon: '📷', text: 'Instagram', href: '#' },
                  { icon: '💬', text: 'WhatsApp', href: 'https://api.whatsapp.com/send?phone=6283878515387&text=Halo,%20saya%20tertarik%20dengan%20Kost%20Pondok%20Qonitaat' }
                ].map((social, index) => (
                  <a 
                    key={index}
                    href={social.href}
                    target={social.icon === '💬' ? '_blank' : undefined}
                    rel={social.icon === '💬' ? 'noopener noreferrer' : undefined}
                    style={styles.socialButton}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#667eea';
                      e.currentTarget.style.color = 'white';
                      e.currentTarget.style.transform = 'translateX(5px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#f1f5f9';
                      e.currentTarget.style.color = '#334155';
                      e.currentTarget.style.transform = 'translateX(0)';
                    }}
                  >
                    {social.icon} {social.text}
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div style={{
            ...styles.formSection,
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateX(0)' : 'translateX(30px)',
            transition: 'all 0.8s ease-out 0.3s',
          }}>
            <h2 style={styles.formTitle}>Kirim Pesan</h2>
            
            {submitted && (
              <div style={{
                ...styles.successMessage,
                animation: 'fadeIn 0.5s ease-out',
              }}>
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
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#667eea';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#e2e8f0';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
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
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#667eea';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#e2e8f0';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
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
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#667eea';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#e2e8f0';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
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
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#667eea';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#e2e8f0';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
              </div>

              <button 
                type="submit" 
                style={styles.submitButton}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(102, 126, 234, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                📤 Kirim Pesan
              </button>
            </form>
          </div>
        </div>

        {/* SECTION GOOGLE MAPS - UPGRADED */}
        <div style={{
          ...styles.mapSection,
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(30px)',
          transition: 'all 0.8s ease-out 1.5s',
        }}>
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
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)';
                      e.currentTarget.style.boxShadow = '0 8px 20px rgba(102, 126, 234, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0) scale(1)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    🧭 Buka di Google Maps
                  </a>
                  <a
                    href={googleMapsLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={styles.mapButtonSecondary}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
                      e.currentTarget.style.color = 'white';
                      e.currentTarget.style.transform = 'translateY(-3px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'white';
                      e.currentTarget.style.color = '#667eea';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
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
    transition: 'all 0.3s ease',
    cursor: 'pointer',
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
    transition: 'all 0.3s ease',
    cursor: 'pointer',
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
    transition: 'all 0.3s ease',
    outline: 'none',
  },
  textarea: {
    padding: '0.875rem',
    border: '2px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '1rem',
    resize: 'vertical',
    fontFamily: 'inherit',
    transition: 'all 0.3s ease',
    outline: 'none',
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
    transition: 'all 0.3s ease',
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
    transition: 'all 0.3s ease',
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
    transition: 'all 0.3s ease',
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