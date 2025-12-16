// Lokasi: app/admin/reservasi/page.tsx

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
  nama_user: string;
  email_user: string;
  nama_kost: string;
  alamat_kost: string;
}

export default function AdminReservasiPage() {
  const router = useRouter();
  const [reservasi, setReservasi] = useState<Reservasi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    // Check admin access
    const userData = sessionStorage.getItem('user') || localStorage.getItem('user');
    
    if (!userData) {
      router.push('/login');
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);
      
      if (parsedUser.role !== 'admin') {
        alert('Akses ditolak.');
        router.push('/dashboard');
        return;
      }
      
      fetchReservasi();
    } catch (error) {
      console.error('Error:', error);
      router.push('/login');
    }
  }, [router]);

  const fetchReservasi = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/admin/reservasi', {
        cache: 'no-store',
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        const reservasiData = Array.isArray(data.data) ? data.data : [];
        setReservasi(reservasiData);
      } else {
        setError(data.message || 'Gagal memuat data reservasi');
        setReservasi([]);
      }
    } catch (error) {
      console.error('Error fetching reservasi:', error);
      setError('Terjadi kesalahan saat memuat data');
      setReservasi([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: number, newStatus: string) => {
    if (!confirm(`Ubah status reservasi menjadi "${newStatus}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/reservasi/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        alert('Status reservasi berhasil diupdate!');
        fetchReservasi();
      } else {
        alert(data.message || 'Gagal mengupdate status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Terjadi kesalahan saat mengupdate status');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return '#f59e0b';
      case 'confirmed':
        return '#10b981';
      case 'completed':
        return '#6b7280';
      case 'cancelled':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'Pending';
      case 'confirmed':
        return 'Confirmed';
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const filteredReservasi = filter === 'all' 
    ? reservasi 
    : reservasi.filter(r => r.status.toLowerCase() === filter);

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
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Kelola Reservasi</h1>
          <p style={styles.subtitle}>Manage semua reservasi pengguna</p>
        </div>
      </div>

      <div style={styles.backLink}>
        <a href="/admin" style={styles.link}>← Kembali ke Dashboard</a>
      </div>

      {/* Filter */}
      <div style={styles.filterBar}>
        <button
          onClick={() => setFilter('all')}
          style={{
            ...styles.filterBtn,
            ...(filter === 'all' ? styles.filterBtnActive : {})
          }}
        >
          Semua ({reservasi.length})
        </button>
        <button
          onClick={() => setFilter('pending')}
          style={{
            ...styles.filterBtn,
            ...(filter === 'pending' ? styles.filterBtnActive : {})
          }}
        >
          Pending ({reservasi.filter(r => r.status === 'pending').length})
        </button>
        <button
          onClick={() => setFilter('confirmed')}
          style={{
            ...styles.filterBtn,
            ...(filter === 'confirmed' ? styles.filterBtnActive : {})
          }}
        >
          Confirmed ({reservasi.filter(r => r.status === 'confirmed').length})
        </button>
        <button
          onClick={() => setFilter('completed')}
          style={{
            ...styles.filterBtn,
            ...(filter === 'completed' ? styles.filterBtnActive : {})
          }}
        >
          Completed ({reservasi.filter(r => r.status === 'completed').length})
        </button>
        <button
          onClick={() => setFilter('cancelled')}
          style={{
            ...styles.filterBtn,
            ...(filter === 'cancelled' ? styles.filterBtnActive : {})
          }}
        >
          Cancelled ({reservasi.filter(r => r.status === 'cancelled').length})
        </button>
      </div>

      {error && (
        <div style={styles.errorAlert}>
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {filteredReservasi.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>📋</div>
          <h2>Tidak Ada Reservasi</h2>
          <p>Belum ada reservasi {filter !== 'all' ? `dengan status ${filter}` : ''}</p>
        </div>
      ) : (
        <div style={styles.reservasiList}>
          {filteredReservasi.map((item) => (
            <div key={item.id} style={styles.reservasiCard}>
              <div style={styles.cardHeader}>
                <div>
                  <h3 style={styles.kostName}>{item.nama_kost}</h3>
                  <p style={styles.userName}>👤 {item.nama_user} ({item.email_user})</p>
                  <p style={styles.location}>📍 {item.alamat_kost}</p>
                </div>
                <span style={{
                  ...styles.statusBadge,
                  background: getStatusColor(item.status)
                }}>
                  {getStatusText(item.status)}
                </span>
              </div>

              <div style={styles.cardBody}>
                <div style={styles.infoGrid}>
                  <div style={styles.infoItem}>
                    <span style={styles.infoLabel}>ID Reservasi:</span>
                    <span style={styles.infoValue}>#{item.id}</span>
                  </div>
                  <div style={styles.infoItem}>
                    <span style={styles.infoLabel}>Durasi:</span>
                    <span style={styles.infoValue}>{item.durasi_bulan} Bulan</span>
                  </div>
                  <div style={styles.infoItem}>
                    <span style={styles.infoLabel}>Total Harga:</span>
                    <span style={styles.infoValue}>{formatCurrency(item.total_harga)}</span>
                  </div>
                  <div style={styles.infoItem}>
                    <span style={styles.infoLabel}>Tanggal Mulai:</span>
                    <span style={styles.infoValue}>{formatDate(item.tanggal_mulai)}</span>
                  </div>
                  <div style={styles.infoItem}>
                    <span style={styles.infoLabel}>Tanggal Selesai:</span>
                    <span style={styles.infoValue}>{formatDate(item.tanggal_selesai)}</span>
                  </div>
                  <div style={styles.infoItem}>
                    <span style={styles.infoLabel}>Tanggal Booking:</span>
                    <span style={styles.infoValue}>{formatDate(item.created_at)}</span>
                  </div>
                </div>

                {item.catatan && (
                  <div style={styles.catatan}>
                    <strong>Catatan:</strong>
                    <p>{item.catatan}</p>
                  </div>
                )}
              </div>

              <div style={styles.cardFooter}>
                <strong>Ubah Status:</strong>
                <div style={styles.actionBtns}>
                  {item.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleUpdateStatus(item.id, 'confirmed')}
                        style={styles.confirmBtn}
                      >
                        ✓ Konfirmasi
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(item.id, 'cancelled')}
                        style={styles.cancelBtn}
                      >
                        ✗ Tolak
                      </button>
                    </>
                  )}
                  {item.status === 'confirmed' && (
                    <button
                      onClick={() => handleUpdateStatus(item.id, 'completed')}
                      style={styles.completeBtn}
                    >
                      ✓ Selesaikan
                    </button>
                  )}
                  {(item.status === 'completed' || item.status === 'cancelled') && (
                    <span style={styles.finalStatus}>Status final - tidak dapat diubah</span>
                  )}
                </div>
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
    padding: '2rem',
    maxWidth: '1400px',
    margin: '0 auto',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '50vh',
    gap: '1rem',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #e5e7eb',
    borderTop: '4px solid #dc2626',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  header: {
    marginBottom: '2rem',
  },
  title: {
    fontSize: '2rem',
    color: '#333',
    marginBottom: '0.5rem',
  },
  subtitle: {
    color: '#666',
  },
  backLink: {
    marginBottom: '1.5rem',
  },
  link: {
    color: '#2563eb',
    textDecoration: 'none',
    fontWeight: 600,
  },
  filterBar: {
    display: 'flex',
    gap: '1rem',
    marginBottom: '2rem',
    flexWrap: 'wrap',
  },
  filterBtn: {
    padding: '0.75rem 1.5rem',
    background: 'white',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 600,
    color: '#666',
    transition: 'all 0.3s',
  },
  filterBtnActive: {
    background: '#dc2626',
    color: 'white',
    borderColor: '#dc2626',
  },
  errorAlert: {
    background: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '12px',
    padding: '1rem',
    marginBottom: '1.5rem',
    display: 'flex',
    gap: '1rem',
    color: '#991b1b',
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
  reservasiList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  reservasiCard: {
    background: 'white',
    borderRadius: '15px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    overflow: 'hidden',
  },
  cardHeader: {
    padding: '1.5rem',
    background: '#f9fafb',
    borderBottom: '1px solid #e5e7eb',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'start',
  },
  kostName: {
    fontSize: '1.3rem',
    color: '#333',
    marginBottom: '0.5rem',
  },
  userName: {
    color: '#666',
    fontSize: '0.95rem',
    marginBottom: '0.25rem',
  },
  location: {
    color: '#666',
    fontSize: '0.9rem',
  },
  statusBadge: {
    padding: '0.5rem 1rem',
    borderRadius: '20px',
    color: 'white',
    fontSize: '0.85rem',
    fontWeight: 600,
  },
  cardBody: {
    padding: '1.5rem',
  },
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '1rem',
    marginBottom: '1rem',
  },
  infoItem: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '0.75rem',
    background: '#f9fafb',
    borderRadius: '8px',
  },
  infoLabel: {
    fontWeight: 600,
    color: '#666',
  },
  infoValue: {
    color: '#333',
  },
  catatan: {
    background: '#fffbeb',
    padding: '1rem',
    borderRadius: '8px',
    borderLeft: '4px solid #f59e0b',
  },
  cardFooter: {
    padding: '1rem 1.5rem',
    background: '#f9fafb',
    borderTop: '1px solid #e5e7eb',
  },
  actionBtns: {
    display: 'flex',
    gap: '1rem',
    marginTop: '0.5rem',
  },
  confirmBtn: {
    padding: '0.75rem 1.5rem',
    background: '#10b981',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 600,
  },
  cancelBtn: {
    padding: '0.75rem 1.5rem',
    background: '#ef4444',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 600,
  },
  completeBtn: {
    padding: '0.75rem 1.5rem',
    background: '#6b7280',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 600,
  },
  finalStatus: {
    color: '#666',
    fontStyle: 'italic',
  },
};