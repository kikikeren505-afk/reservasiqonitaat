'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Kost {
  id: number;
  nama: string;
  kelas: string;
  fasilitas: string;
  ukuran: string;
  harga: string;
  gambar: string;
  status: 'tersedia' | 'penuh';
}

const daftarKost: Kost[] = [
  {
    id: 1,
    nama: 'Class 1',
    kelas: 'Fasilitas',
    fasilitas: 'Kamar mandi dalam, Ac, Kasur, Lemari, dan Wi-Fi',
    ukuran: 'Ukuran Kamar 4x4 M',
    harga: 'Rp 12.000.000 / Tahun',
    gambar: "/images/kost/class1.jpeg",
    status: 'tersedia'
  },
  {
    id: 2,
    nama: 'Class 2',
    kelas: 'Fasilitas',
    fasilitas: 'Kamar mandi dalam, Kasur, Lemari, dan Wi-Fi',
    ukuran: 'Ukuran Kamar 4x4 M',
    harga: 'Rp 10.000.000 / Tahun',
    gambar: "/images/kost/class2.jpeg",
    status: 'tersedia'
  },
  {
    id: 3,
    nama: 'Class 3',
    kelas: 'Fasilitas',
    fasilitas: 'Kamar mandi dalam, Kasur, Lemari, dan Wi-Fi',
    ukuran: 'Ukuran Kamar 3x5 M',
    harga: 'Rp 8.000.000 / Tahun',
    gambar: "/images/kost/class2.jpeg",
    status: 'tersedia'
  }
];

export default function KostPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'semua' | 'tersedia' | 'penuh'>('tersedia');

  useEffect(() => {
    // Cek apakah user sudah login
    const userFromLocalStorage = localStorage.getItem('user');
    const userFromSessionStorage = sessionStorage.getItem('user');
    
    if (!userFromLocalStorage && !userFromSessionStorage) {
      // Jika belum login, redirect ke halaman login
      router.push('/login');
    } else {
      setIsLoading(false);
    }
  }, [router]);

  const filteredKost = daftarKost.filter(kost => {
    const matchSearch = kost.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       kost.fasilitas.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === 'semua' || kost.status === filterStatus;
    return matchSearch && matchStatus;
  });

  // Tampilkan loading saat mengecek autentikasi
  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(to bottom, #f97316 0%, #ea580c 100%)',
      }}>
        <div style={{
          background: 'white',
          padding: '2rem 3rem',
          borderRadius: '15px',
          textAlign: 'center'
        }}>
          <p style={{ fontSize: '1.2rem', color: '#666' }}>Memeriksa autentikasi...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Daftar Kost Pondok Qonitaat</h1>
        <p style={styles.subtitle}>Temukan kost impian Anda di Medan</p>
      </div>

      <div style={styles.searchSection}>
        <div style={styles.searchWrapper}>
          <input
            type="text"
            placeholder="Cari nama kost atau lokasi..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
          <button style={styles.searchButton}>🔍 Cari</button>
        </div>
        
        <div style={styles.filterWrapper}>
          <label style={styles.filterLabel}>Filter Status:</label>
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            style={styles.filterSelect}
          >
            <option value="semua">Semua</option>
            <option value="tersedia">Tersedia</option>
            <option value="penuh">Penuh</option>
          </select>
        </div>
      </div>

      {filteredKost.length === 0 ? (
        <div style={styles.emptyState}>
          <p style={styles.emptyText}>Tidak ada kost yang ditemukan</p>
        </div>
      ) : (
        <div style={styles.kostGrid}>
          {filteredKost.map((kost) => (
            <div key={kost.id} style={styles.kostCard}>
              <div style={styles.imageWrapper}>
                <img 
                  src={kost.gambar} 
                  alt={kost.nama}
                  style={styles.kostImage}
                />
                <div style={{
                  ...styles.statusBadge,
                  backgroundColor: kost.status === 'tersedia' ? '#10b981' : '#ef4444'
                }}>
                  {kost.status === 'tersedia' ? '✓ Tersedia' : '✕ Penuh'}
                </div>
              </div>
              
              <div style={styles.kostContent}>
                <h3 style={styles.kostNama}>{kost.nama}</h3>
                <p style={styles.kostKelas}>{kost.kelas}</p>
                <p style={styles.kostFasilitas}>{kost.fasilitas}</p>
                <p style={styles.kostUkuran}>{kost.ukuran}</p>
                <p style={styles.kostHarga}>{kost.harga}</p>
                
                <Link 
                  href={`/reservasi?kost_id=${kost.id}`}
                  style={{
                    ...styles.bookingButton,
                    opacity: kost.status === 'penuh' ? 0.5 : 1,
                    cursor: kost.status === 'penuh' ? 'not-allowed' : 'pointer'
                  }}
                  onClick={(e) => {
                    if (kost.status === 'penuh') e.preventDefault();
                  }}
                >
                  {kost.status === 'tersedia' ? 'Booking' : 'Tidak Tersedia'}
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(to bottom, #f97316 0%, #ea580c 100%)',
    padding: '2rem',
  },
  header: {
    textAlign: 'center',
    color: 'white',
    marginBottom: '2rem',
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    marginBottom: '0.5rem',
  },
  subtitle: {
    fontSize: '1.1rem',
    opacity: 0.9,
  },
  searchSection: {
    maxWidth: '1200px',
    margin: '0 auto 2rem',
    background: 'white',
    padding: '1.5rem',
    borderRadius: '15px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
  },
  searchWrapper: {
    display: 'flex',
    gap: '1rem',
    marginBottom: '1rem',
  },
  searchInput: {
    flex: 1,
    padding: '0.875rem',
    border: '2px solid #e5e7eb',
    borderRadius: '10px',
    fontSize: '1rem',
  },
  searchButton: {
    padding: '0.875rem 2rem',
    background: '#2563eb',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '1rem',
    fontWeight: 600,
    cursor: 'pointer',
  },
  filterWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  filterLabel: {
    fontWeight: 600,
    color: '#333',
  },
  filterSelect: {
    padding: '0.5rem 1rem',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '0.95rem',
    cursor: 'pointer',
  },
  kostGrid: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '2rem',
  },
  kostCard: {
    background: 'white',
    borderRadius: '15px',
    overflow: 'hidden',
    boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
    transition: 'transform 0.3s, box-shadow 0.3s',
    cursor: 'pointer',
  },
  imageWrapper: {
    position: 'relative',
    height: '200px',
    overflow: 'hidden',
  },
  kostImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  statusBadge: {
    position: 'absolute',
    top: '10px',
    right: '10px',
    padding: '0.5rem 1rem',
    color: 'white',
    borderRadius: '20px',
    fontSize: '0.85rem',
    fontWeight: 'bold',
  },
  kostContent: {
    padding: '1.5rem',
  },
  kostNama: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '0.5rem',
  },
  kostKelas: {
    fontSize: '0.9rem',
    color: '#666',
    marginBottom: '0.75rem',
  },
  kostFasilitas: {
    fontSize: '0.95rem',
    color: '#555',
    marginBottom: '0.5rem',
    lineHeight: 1.5,
  },
  kostUkuran: {
    fontSize: '0.9rem',
    color: '#666',
    marginBottom: '1rem',
  },
  kostHarga: {
    fontSize: '1.25rem',
    fontWeight: 'bold',
    color: '#f97316',
    marginBottom: '1rem',
  },
  bookingButton: {
    display: 'block',
    width: '100%',
    padding: '0.875rem',
    background: '#c2410c',
    color: 'white',
    textAlign: 'center',
    textDecoration: 'none',
    borderRadius: '10px',
    fontSize: '1.1rem',
    fontWeight: 'bold',
    transition: 'background 0.3s',
  },
  emptyState: {
    maxWidth: '1200px',
    margin: '4rem auto',
    textAlign: 'center',
    background: 'white',
    padding: '3rem',
    borderRadius: '15px',
  },
  emptyText: {
    fontSize: '1.25rem',
    color: '#666',
  },
};