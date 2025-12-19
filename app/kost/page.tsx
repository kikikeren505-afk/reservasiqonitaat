'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Kost {
  id: number;
  nama: string;
  alamat: string;
  harga: number;
  deskripsi: string;
  fasilitas: string;
  status: 'tersedia' | 'penuh';
  created_at?: string;
}

export default function KostPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'semua' | 'tersedia' | 'penuh'>('tersedia');
  const [daftarKost, setDaftarKost] = useState<Kost[]>([]); // ✅ State untuk data dari API

  useEffect(() => {
    // Cek apakah user sudah login
    const userFromLocalStorage = localStorage.getItem('user');
    const userFromSessionStorage = sessionStorage.getItem('user');
    
    if (!userFromLocalStorage && !userFromSessionStorage) {
      router.push('/login');
    } else {
      fetchKostData(); // ✅ Fetch data dari API
    }
  }, [router]);

  // ✅ FUNGSI BARU: Fetch data kost dari API
  const fetchKostData = async () => {
    try {
      setIsLoading(true);
      
      const response = await fetch('/api/admin/kost', {
        method: 'GET',
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        setDaftarKost(data.data || []);
      } else {
        console.error('Failed to fetch kost data:', data.message);
        setDaftarKost([]);
      }
    } catch (error) {
      console.error('Error fetching kost:', error);
      setDaftarKost([]);
    } finally {
      setIsLoading(false);
      setTimeout(() => setMounted(true), 100);
    }
  };

  const filteredKost = daftarKost.filter(kost => {
    const matchSearch = kost.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       kost.fasilitas.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === 'semua' || kost.status === filterStatus;
    return matchSearch && matchStatus;
  });

  // ✅ Helper function untuk format harga
  const formatHarga = (harga: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(harga);
  };

  // ✅ Helper function untuk get gambar berdasarkan nama kost
  const getKostImage = (nama: string) => {
    if (nama.toLowerCase().includes('class 1') || nama.toLowerCase().includes('kelas 1')) {
      return '/images/kost/class1.jpeg';
    } else if (nama.toLowerCase().includes('class 2') || nama.toLowerCase().includes('kelas 2')) {
      return '/images/kost/class2.jpeg';
    } else if (nama.toLowerCase().includes('class 3') || nama.toLowerCase().includes('kelas 3')) {
      return '/images/kost/class2.jpeg';
    }
    return '/images/kost/class1.jpeg'; // default
  };

  // ✅ Helper function untuk ekstrak ukuran kamar dari deskripsi atau nama
  const getUkuranKamar = (kost: Kost) => {
    // Coba cari di deskripsi atau nama
    const text = `${kost.nama} ${kost.deskripsi}`.toLowerCase();
    if (text.includes('4x4')) return 'Ukuran Kamar 4x4 M';
    if (text.includes('3x5')) return 'Ukuran Kamar 3x5 M';
    return 'Ukuran Kamar 4x4 M'; // default
  };

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
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #e5e7eb',
            borderTop: '4px solid #f97316',
            borderRadius: '50%',
            margin: '0 auto 1rem',
            animation: 'spin 1s linear infinite',
          }}></div>
          <p style={{ fontSize: '1.2rem', color: '#666' }}>Memuat data kost...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={{
        ...styles.header,
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'translateY(0)' : 'translateY(-30px)',
        transition: 'all 0.8s ease-out',
      }}>
        <h1 style={styles.title}>Daftar Kost Pondok Qonitaat</h1>
        <p style={styles.subtitle}>Temukan kost impian Anda di Medan</p>
      </div>

      <div style={{
        ...styles.searchSection,
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'translateY(0)' : 'translateY(30px)',
        transition: 'all 0.8s ease-out 0.2s',
      }}>
        <div style={styles.searchWrapper}>
          <input
            type="text"
            placeholder="Cari tipe kamar..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = '#2563eb';
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = '#e5e7eb';
              e.currentTarget.style.boxShadow = 'none';
            }}
          />
          <button 
            style={styles.searchButton}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#1d4ed8';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(37, 99, 235, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#2563eb';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            🔍 Cari
          </button>
        </div>
        
        <div style={styles.filterWrapper}>
          <label style={styles.filterLabel}>Filter Status:</label>
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            style={styles.filterSelect}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = '#2563eb';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = '#e5e7eb';
            }}
          >
            <option value="semua">Semua</option>
            <option value="tersedia">Tersedia</option>
            <option value="penuh">Penuh</option>
          </select>
        </div>
      </div>

      {filteredKost.length === 0 ? (
        <div style={{
          ...styles.emptyState,
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'scale(1)' : 'scale(0.9)',
          transition: 'all 0.6s ease-out 0.4s',
        }}>
          <p style={styles.emptyText}>Tidak ada kost yang ditemukan</p>
        </div>
      ) : (
        <div style={styles.kostGrid}>
          {filteredKost.map((kost, index) => (
            <div 
              key={kost.id} 
              style={{
                ...styles.kostCard,
                opacity: mounted ? 1 : 0,
                transform: mounted ? 'translateY(0)' : 'translateY(30px)',
                transition: `all 0.6s ease-out ${0.3 + index * 0.1}s`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-10px) scale(1.02)';
                e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.25)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.15)';
              }}
            >
              <div style={styles.imageWrapper}>
                <img 
                  src={getKostImage(kost.nama)} 
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
                <p style={styles.kostKelas}>Fasilitas</p>
                <p style={styles.kostFasilitas}>{kost.fasilitas}</p>
                <p style={styles.kostUkuran}>{getUkuranKamar(kost)}</p>
                <p style={styles.kostHarga}>{formatHarga(kost.harga)} / Tahun</p>
                
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
                  onMouseEnter={(e) => {
                    if (kost.status === 'tersedia') {
                      e.currentTarget.style.background = '#9a3412';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(194, 65, 12, 0.4)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (kost.status === 'tersedia') {
                      e.currentTarget.style.background = '#c2410c';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }
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
    transition: 'all 0.3s ease',
    outline: 'none',
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
    transition: 'all 0.3s ease',
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
    transition: 'all 0.3s ease',
    outline: 'none',
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
    transition: 'all 0.4s ease',
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
    transition: 'transform 0.4s ease',
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
    transition: 'all 0.3s ease',
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