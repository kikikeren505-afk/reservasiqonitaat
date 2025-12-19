// Lokasi: app/dashboard/reservasi/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Reservasi {
  id: number;
  user_id: number;
  kost_id: number;
  tanggal_mulai: string;
  tanggal_selesai: string;
  durasi_bulan: number;
  total_harga: number;
  status: string;
  catatan: string | null;
  created_at: string;
  // Data dari join dengan tabel kost
  nama_kost?: string;
  alamat_kost?: string;
  harga_kost?: number;
}

export default function ReservasiPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [reservasi, setReservasi] = useState<Reservasi[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const userData = sessionStorage.getItem('user') || localStorage.getItem('user');
    
    if (!userData) {
      router.push('/login');
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);
      console.log('User data:', parsedUser);
      setUser(parsedUser);
      
      // Get user ID - support both 'id' and 'user_id' fields
      const userId = parsedUser.id || parsedUser.user_id;
      console.log('Fetching reservasi for user ID:', userId);
      
      if (!userId) {
        setError('User ID tidak ditemukan. Silakan login kembali.');
        setLoading(false);
        return;
      }
      
      fetchReservasi(userId);
    } catch (error) {
      console.error('Error parsing user data:', error);
      router.push('/login');
    }
  }, [router]);

  useEffect(() => {
    if (!loading) {
      setTimeout(() => setMounted(true), 100);
    }
  }, [loading]);

  const fetchReservasi = async (userId: number) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Calling API: /api/reservasi?user_id=' + userId);
      
      const response = await fetch(`/api/reservasi?user_id=${userId}`, {
        cache: 'no-store',
      });
      
      console.log('Response status:', response.status);
      
      const data = await response.json();
      console.log('API Response:', data);
      
      if (response.ok && data.success) {
        setReservasi(data.data || []);
        console.log('Reservasi loaded:', data.data?.length || 0, 'items');
      } else {
        console.error('API Error:', data.message);
        setError(data.message || 'Gagal memuat data reservasi');
      }
    } catch (error) {
      console.error('Error fetching reservasi:', error);
      setError('Terjadi kesalahan saat memuat data reservasi');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return '#f59e0b';
      case 'confirmed':
      case 'aktif':
        return '#10b981';
      case 'completed':
      case 'selesai':
        return '#6b7280';
      case 'cancelled':
      case 'dibatalkan':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'Menunggu Konfirmasi';
      case 'confirmed':
        return 'Dikonfirmasi';
      case 'aktif':
        return 'Aktif';
      case 'completed':
        return 'Selesai';
      case 'selesai':
        return 'Selesai';
      case 'cancelled':
        return 'Dibatalkan';
      case 'dibatalkan':
        return 'Dibatalkan';
      default:
        return status;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Memuat data reservasi...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={{
        ...styles.header,
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'translateY(0)' : 'translateY(-20px)',
        transition: 'all 0.8s ease-out',
      }}>
        <h1 style={styles.title}>Reservasi Saya</h1>
        <p style={styles.subtitle}>Kelola dan pantau reservasi kost Anda</p>
      </div>

      {error && (
        <div style={{
          ...styles.errorAlert,
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'scale(1)' : 'scale(0.95)',
          transition: 'all 0.5s ease-out 0.2s',
        }}>
          <span style={styles.errorIcon}>⚠️</span>
          <div>
            <strong>Error:</strong> {error}
          </div>
        </div>
      )}

      {reservasi.length === 0 ? (
        <div style={{
          ...styles.emptyState,
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'scale(1)' : 'scale(0.95)',
          transition: 'all 0.8s ease-out 0.3s',
        }}>
          <div style={styles.emptyIcon}>📋</div>
          <h2 style={styles.emptyTitle}>Belum Ada Reservasi</h2>
          <p style={styles.emptyText}>
            Anda belum memiliki reservasi. Mulai cari kost yang sesuai dengan kebutuhan Anda.
          </p>
          <a 
            href="/kost" 
            style={styles.browseBtn}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#1d4ed8';
              e.currentTarget.style.transform = 'translateY(-3px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(37, 99, 235, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#2563eb';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            Cari Kost Sekarang
          </a>
        </div>
      ) : (
        <div style={styles.reservasiList}>
          {reservasi.map((item, index) => (
            <div 
              key={item.id} 
              style={{
                ...styles.reservasiCard,
                opacity: mounted ? 1 : 0,
                transform: mounted ? 'translateY(0)' : 'translateY(30px)',
                transition: `all 0.6s ease-out ${0.3 + index * 0.15}s`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
              }}
            >
              <div style={styles.cardHeader}>
                <div>
                  <h3 style={styles.kostName}>
                    {item.nama_kost || 'Kost Pondok Qonitaat - Class ' + item.kost_id}
                  </h3>
                  {item.alamat_kost && (
                    <p style={styles.kostLocation}>📍 {item.alamat_kost}</p>
                  )}
                </div>
                <span 
                  style={{
                    ...styles.statusBadge,
                    background: getStatusColor(item.status)
                  }}
                >
                  {getStatusText(item.status)}
                </span>
              </div>

              <div style={styles.cardBody}>
                <div style={styles.infoGrid}>
                  <div style={styles.infoItem}>
                    <span style={styles.infoLabel}>Durasi</span>
                    <span style={styles.infoValue}>{item.durasi_bulan} Bulan</span>
                  </div>
                  <div style={styles.infoItem}>
                    <span style={styles.infoLabel}>Total Harga</span>
                    <span style={styles.infoValue}>
                      {formatCurrency(item.total_harga)}
                    </span>
                  </div>
                  <div style={styles.infoItem}>
                    <span style={styles.infoLabel}>Tanggal Mulai</span>
                    <span style={styles.infoValue}>
                      {formatDate(item.tanggal_mulai)}
                    </span>
                  </div>
                  <div style={styles.infoItem}>
                    <span style={styles.infoLabel}>Tanggal Selesai</span>
                    <span style={styles.infoValue}>
                      {formatDate(item.tanggal_selesai)}
                    </span>
                  </div>
                  <div style={styles.infoItem}>
                    <span style={styles.infoLabel}>ID Reservasi</span>
                    <span style={styles.infoValue}>#{item.id}</span>
                  </div>
                  <div style={styles.infoItem}>
                    <span style={styles.infoLabel}>Tanggal Booking</span>
                    <span style={styles.infoValue}>
                      {formatDate(item.created_at)}
                    </span>
                  </div>
                </div>

                {item.catatan && (
                  <div style={styles.catatan}>
                    <strong>Catatan:</strong>
                    <p style={styles.catatanText}>{item.catatan}</p>
                  </div>
                )}
              </div>

              <div style={styles.cardFooter}>
                {item.status.toLowerCase() === 'pending' && (
                  <p style={styles.footerNote}>
                    ⏳ Menunggu konfirmasi dari admin. Kami akan menghubungi Anda segera.
                  </p>
                )}
                {(item.status.toLowerCase() === 'confirmed' || item.status.toLowerCase() === 'aktif') && (
                  <p style={styles.footerNote}>
                    ✅ Reservasi Anda aktif. Selamat menempati kost!
                  </p>
                )}
                {(item.status.toLowerCase() === 'completed' || item.status.toLowerCase() === 'selesai') && (
                  <p style={styles.footerNote}>
                    ✓ Masa sewa telah berakhir. Terima kasih!
                  </p>
                )}
                {(item.status.toLowerCase() === 'cancelled' || item.status.toLowerCase() === 'dibatalkan') && (
                  <p style={styles.footerNote}>
                    ✗ Reservasi dibatalkan.
                  </p>
                )}
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
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '2rem',
    minHeight: '100vh',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '50vh',
    color: '#666',
    gap: '1rem',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #e5e7eb',
    borderTop: '4px solid #2563eb',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  header: {
    marginBottom: '2rem',
  },
  title: {
    fontSize: '2.5rem',
    color: '#333',
    marginBottom: '0.5rem',
  },
  subtitle: {
    fontSize: '1.1rem',
    color: '#666',
  },
  errorAlert: {
    background: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '12px',
    padding: '1rem',
    marginBottom: '1.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    color: '#991b1b',
  },
  errorIcon: {
    fontSize: '1.5rem',
  },
  emptyState: {
    textAlign: 'center',
    padding: '4rem 2rem',
    background: 'white',
    borderRadius: '15px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  emptyIcon: {
    fontSize: '5rem',
    marginBottom: '1rem',
  },
  emptyTitle: {
    fontSize: '1.8rem',
    color: '#333',
    marginBottom: '0.5rem',
  },
  emptyText: {
    color: '#666',
    fontSize: '1.1rem',
    marginBottom: '2rem',
  },
  browseBtn: {
    display: 'inline-block',
    padding: '1rem 2rem',
    background: '#2563eb',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '10px',
    fontWeight: 600,
    transition: 'all 0.3s ease',
    cursor: 'pointer',
  },
  reservasiList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  reservasiCard: {
    background: 'white',
    borderRadius: '15px',
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'start',
    padding: '1.5rem',
    background: '#f9fafb',
    borderBottom: '1px solid #e5e7eb',
  },
  kostName: {
    fontSize: '1.5rem',
    color: '#333',
    marginBottom: '0.25rem',
    fontWeight: 'bold',
  },
  kostLocation: {
    color: '#666',
    fontSize: '0.95rem',
  },
  statusBadge: {
    padding: '0.5rem 1rem',
    borderRadius: '20px',
    color: 'white',
    fontSize: '0.85rem',
    fontWeight: 600,
    textTransform: 'capitalize',
  },
  cardBody: {
    padding: '1.5rem',
  },
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem',
    marginBottom: '1.5rem',
  },
  infoItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  },
  infoLabel: {
    fontSize: '0.85rem',
    color: '#666',
    fontWeight: 600,
  },
  infoValue: {
    fontSize: '1rem',
    color: '#333',
  },
  catatan: {
    background: '#f9fafb',
    padding: '1rem',
    borderRadius: '8px',
    fontSize: '0.95rem',
  },
  catatanText: {
    color: '#666',
    marginTop: '0.5rem',
  },
  cardFooter: {
    padding: '1rem 1.5rem',
    background: '#f9fafb',
    borderTop: '1px solid #e5e7eb',
  },
  footerNote: {
    margin: 0,
    color: '#666',
    fontSize: '0.9rem',
  },
};