'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

interface KostDetail {
  Kost_id: number;
  Nama_kost: string;
  Alamat_kost: string;
  Deskripsi: string;
  Status: string;
}

interface Kategori {
  Kategori_id: number;
  Harga: number;
  Ukuran_kamar: string;
  Fasilitas: string;
}

export default function KostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [kost, setKost] = useState<KostDetail | null>(null);
  const [kategoriList, setKategoriList] = useState<Kategori[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedKamar, setSelectedKamar] = useState<number | null>(null);

  useEffect(() => {
    if (params.id) {
      fetchKostDetail();
    }
  }, [params.id]);

  const fetchKostDetail = async () => {
    try {
      // Fetch kost detail
      const kostResponse = await fetch(`/api/kost/${params.id}`);
      const kostData = await kostResponse.json();
      
      if (kostResponse.ok) {
        setKost(kostData.data);
      }

      // Fetch kategori/rooms
      const kategoriResponse = await fetch(`/api/kost/${params.id}/kategori`);
      const kategoriData = await kategoriResponse.json();
      
      if (kategoriResponse.ok) {
        setKategoriList(kategoriData.data || []);
      }
    } catch (error) {
      console.error('Error fetching kost detail:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReservation = async () => {
    if (!selectedKamar) {
      alert('Silakan pilih tipe kamar terlebih dahulu');
      return;
    }

    // Check if user is logged in
    const userData = sessionStorage.getItem('user') || localStorage.getItem('user');
    
    if (!userData) {
      alert('Silakan login terlebih dahulu');
      router.push('/login');
      return;
    }

    const user = JSON.parse(userData);
    const today = new Date().toISOString().split('T')[0];

    try {
      const response = await fetch('/api/transaksi', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user.user_id,
          kamar_id: selectedKamar,
          tanggal_mulai: today,
          status: 'pending'
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Reservasi berhasil! Silakan cek dashboard Anda.');
        router.push('/dashboard/reservasi');
      } else {
        alert(data.message || 'Reservasi gagal');
      }
    } catch (error) {
      console.error('Reservation error:', error);
      alert('Terjadi kesalahan. Silakan coba lagi.');
    }
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <p>Memuat detail kost...</p>
      </div>
    );
  }

  if (!kost) {
    return (
      <div style={styles.loadingContainer}>
        <p>Kost tidak ditemukan</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Hero Section */}
      <div style={styles.hero}>
        <div style={styles.heroContent}>
          <h1 style={styles.heroTitle}>{kost.Nama_kost}</h1>
          <p style={styles.heroLocation}>📍 {kost.Alamat_kost}</p>
          <span style={styles.statusBadge}>{kost.Status}</span>
        </div>
      </div>

      <div style={styles.contentWrapper}>
        {/* Main Content */}
        <div style={styles.mainContent}>
          {/* Description */}
          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>Deskripsi</h2>
            <p style={styles.description}>
              {kost.Deskripsi || 'Kost nyaman dan strategis dengan fasilitas lengkap di Medan.'}
            </p>
          </section>

          {/* Room Types */}
          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>Tipe Kamar</h2>
            {kategoriList.length === 0 ? (
              <p style={styles.noData}>Tidak ada tipe kamar tersedia</p>
            ) : (
              <div style={styles.roomGrid}>
                {kategoriList.map((kategori) => (
                  <div
                    key={kategori.Kategori_id}
                    style={{
                      ...styles.roomCard,
                      ...(selectedKamar === kategori.Kategori_id ? styles.roomCardSelected : {})
                    }}
                    onClick={() => setSelectedKamar(kategori.Kategori_id)}
                  >
                    <div style={styles.roomIcon}>🛏️</div>
                    <h3 style={styles.roomSize}>{kategori.Ukuran_kamar}</h3>
                    <p style={styles.roomPrice}>
                      Rp {kategori.Harga.toLocaleString('id-ID')}/bulan
                    </p>
                    <div style={styles.roomFacilities}>
                      <strong>Fasilitas:</strong>
                      <p>{kategori.Fasilitas}</p>
                    </div>
                    {selectedKamar === kategori.Kategori_id && (
                      <div style={styles.selectedBadge}>✓ Dipilih</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Facilities */}
          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>Fasilitas Umum</h2>
            <div style={styles.facilitiesGrid}>
              <div style={styles.facilityItem}>✓ WiFi</div>
              <div style={styles.facilityItem}>✓ Parkir</div>
              <div style={styles.facilityItem}>✓ Keamanan 24 Jam</div>
              <div style={styles.facilityItem}>✓ Dapur Bersama</div>
              <div style={styles.facilityItem}>✓ Laundry</div>
              <div style={styles.facilityItem}>✓ Air PDAM</div>
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <aside style={styles.sidebar}>
          <div style={styles.sidebarCard}>
            <h3 style={styles.sidebarTitle}>Booking Sekarang</h3>
            <p style={styles.sidebarText}>
              {selectedKamar 
                ? `Anda memilih kamar ${kategoriList.find(k => k.Kategori_id === selectedKamar)?.Ukuran_kamar}`
                : 'Pilih tipe kamar terlebih dahulu'
              }
            </p>
            <button
              onClick={handleReservation}
              style={styles.bookBtn}
              disabled={!selectedKamar}
            >
              Reservasi Sekarang
            </button>
            <p style={styles.sidebarNote}>
              * Reservasi akan diproses oleh admin
            </p>
          </div>

          <div style={styles.sidebarCard}>
            <h3 style={styles.sidebarTitle}>Kontak</h3>
            <div style={styles.contactInfo}>
              <p>📞 +62 xxx xxxx xxxx</p>
              <p>✉️ info@pondokqonitaat.com</p>
              <p>💬 WhatsApp Admin</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: '100vh',
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '50vh',
    color: '#666',
  },
  hero: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '4rem 2rem',
    color: 'white',
  },
  heroContent: {
    maxWidth: '1400px',
    margin: '0 auto',
  },
  heroTitle: {
    fontSize: '3rem',
    marginBottom: '0.5rem',
  },
  heroLocation: {
    fontSize: '1.2rem',
    marginBottom: '1rem',
    opacity: 0.9,
  },
  statusBadge: {
    background: 'rgba(255, 255, 255, 0.2)',
    padding: '0.5rem 1rem',
    borderRadius: '20px',
    fontSize: '0.9rem',
    fontWeight: 600,
    textTransform: 'capitalize',
  },
  contentWrapper: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '2rem',
    display: 'grid',
    gridTemplateColumns: '1fr 350px',
    gap: '2rem',
  },
  mainContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem',
  },
  section: {
    background: 'white',
    padding: '2rem',
    borderRadius: '15px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  sectionTitle: {
    fontSize: '1.8rem',
    marginBottom: '1rem',
    color: '#333',
  },
  description: {
    color: '#666',
    lineHeight: '1.8',
    fontSize: '1.05rem',
  },
  noData: {
    color: '#666',
    fontStyle: 'italic',
  },
  roomGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '1.5rem',
  },
  roomCard: {
    border: '2px solid #e5e7eb',
    borderRadius: '12px',
    padding: '1.5rem',
    cursor: 'pointer',
    transition: 'all 0.3s',
    position: 'relative',
  },
  roomCardSelected: {
    borderColor: '#2563eb',
    background: '#eff6ff',
  },
  roomIcon: {
    fontSize: '3rem',
    marginBottom: '0.5rem',
  },
  roomSize: {
    fontSize: '1.3rem',
    color: '#333',
    marginBottom: '0.5rem',
  },
  roomPrice: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#2563eb',
    marginBottom: '1rem',
  },
  roomFacilities: {
    color: '#666',
    fontSize: '0.9rem',
  },
  selectedBadge: {
    position: 'absolute',
    top: '1rem',
    right: '1rem',
    background: '#10b981',
    color: 'white',
    padding: '0.25rem 0.75rem',
    borderRadius: '12px',
    fontSize: '0.85rem',
    fontWeight: 600,
  },
  facilitiesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem',
  },
  facilityItem: {
    padding: '1rem',
    background: '#f9fafb',
    borderRadius: '8px',
    color: '#333',
  },
  sidebar: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  sidebarCard: {
    background: 'white',
    padding: '2rem',
    borderRadius: '15px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    position: 'sticky',
    top: '2rem',
  },
  sidebarTitle: {
    fontSize: '1.3rem',
    marginBottom: '1rem',
    color: '#333',
  },
  sidebarText: {
    color: '#666',
    marginBottom: '1.5rem',
  },
  bookBtn: {
    width: '100%',
    padding: '1rem',
    background: '#2563eb',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '1.1rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.3s',
  },
  sidebarNote: {
    marginTop: '1rem',
    fontSize: '0.85rem',
    color: '#666',
    fontStyle: 'italic',
  },
  contactInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    color: '#666',
  },
};