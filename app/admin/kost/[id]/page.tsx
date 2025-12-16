// Lokasi: app/admin/kost/[id]/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Kost {
  id: number;
  nama: string;
  alamat: string;
  harga: number;
  deskripsi: string;
  fasilitas: string;
  status: string;
  created_at: string;
}

export default function KostDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [kost, setKost] = useState<Kost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      
      fetchKostDetail();
    } catch (error) {
      console.error('Error:', error);
      router.push('/login');
    }
  }, [router]);

  const fetchKostDetail = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/kost/${params.id}`, {
        cache: 'no-store',
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        setKost(data.data);
      } else {
        setError(data.message || 'Gagal memuat detail kost');
      }
    } catch (error) {
      console.error('Error fetching kost:', error);
      setError('Terjadi kesalahan saat memuat data');
    } finally {
      setLoading(false);
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
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Memuat detail kost...</p>
      </div>
    );
  }

  if (error || !kost) {
    return (
      <div style={styles.container}>
        <div style={styles.errorCard}>
          <h2>⚠️ Error</h2>
          <p>{error || 'Kost tidak ditemukan'}</p>
          <a href="/admin/kost" style={styles.backBtn}>
            ← Kembali ke Daftar Kost
          </a>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Detail Kost</h1>
        <div style={styles.headerActions}>
          <a href={`/admin/kost/${kost.id}/edit`} style={styles.editBtn}>
            ✏️ Edit Kost
          </a>
        </div>
      </div>

      <div style={styles.backLink}>
        <a href="/admin/kost" style={styles.link}>← Kembali ke Daftar Kost</a>
      </div>

      <div style={styles.detailCard}>
        {/* Header */}
        <div style={styles.cardHeader}>
          <h2 style={styles.kostName}>{kost.nama}</h2>
          <span style={{
            ...styles.statusBadge,
            background: kost.status === 'tersedia' ? '#10b981' : '#6b7280'
          }}>
            {kost.status === 'tersedia' ? '✓ Tersedia' : '✗ Penuh'}
          </span>
        </div>

        {/* Info Grid */}
        <div style={styles.infoGrid}>
          <div style={styles.infoSection}>
            <h3 style={styles.sectionTitle}>Informasi Dasar</h3>
            
            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>ID Kost:</span>
              <span style={styles.infoValue}>#{kost.id}</span>
            </div>

            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>Nama Kost:</span>
              <span style={styles.infoValue}>{kost.nama}</span>
            </div>

            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>Alamat:</span>
              <span style={styles.infoValue}>{kost.alamat}</span>
            </div>

            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>Harga per Bulan:</span>
              <span style={{...styles.infoValue, color: '#10b981', fontWeight: 'bold', fontSize: '1.2rem'}}>
                {formatCurrency(kost.harga)}
              </span>
            </div>

            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>Status:</span>
              <span style={styles.infoValue}>
                {kost.status === 'tersedia' ? 'Tersedia untuk disewa' : 'Sudah penuh'}
              </span>
            </div>

            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>Dibuat pada:</span>
              <span style={styles.infoValue}>{formatDate(kost.created_at)}</span>
            </div>
          </div>

          <div style={styles.infoSection}>
            <h3 style={styles.sectionTitle}>Deskripsi</h3>
            <p style={styles.description}>{kost.deskripsi}</p>
          </div>

          <div style={styles.infoSection}>
            <h3 style={styles.sectionTitle}>Fasilitas</h3>
            <div style={styles.facilitiesList}>
              {kost.fasilitas.split(',').map((fasilitas, index) => (
                <div key={index} style={styles.facilityItem}>
                  ✓ {fasilitas.trim()}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    padding: '2rem',
    maxWidth: '1200px',
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
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
  },
  title: {
    fontSize: '2rem',
    color: '#333',
  },
  headerActions: {
    display: 'flex',
    gap: '1rem',
  },
  editBtn: {
    padding: '0.75rem 1.5rem',
    background: '#f59e0b',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '8px',
    fontWeight: 600,
  },
  backLink: {
    marginBottom: '1.5rem',
  },
  link: {
    color: '#2563eb',
    textDecoration: 'none',
    fontWeight: 600,
  },
  errorCard: {
    background: 'white',
    padding: '3rem',
    borderRadius: '15px',
    textAlign: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  backBtn: {
    display: 'inline-block',
    marginTop: '1rem',
    padding: '0.75rem 1.5rem',
    background: '#2563eb',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '8px',
    fontWeight: 600,
  },
  detailCard: {
    background: 'white',
    borderRadius: '15px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    overflow: 'hidden',
  },
  cardHeader: {
    padding: '2rem',
    background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
    color: 'white',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  kostName: {
    fontSize: '1.8rem',
    margin: 0,
  },
  statusBadge: {
    padding: '0.5rem 1rem',
    borderRadius: '20px',
    color: 'white',
    fontSize: '0.9rem',
    fontWeight: 600,
  },
  infoGrid: {
    padding: '2rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem',
  },
  infoSection: {
    borderBottom: '2px solid #f3f4f6',
    paddingBottom: '1.5rem',
  },
  sectionTitle: {
    fontSize: '1.3rem',
    color: '#333',
    marginBottom: '1rem',
    fontWeight: 'bold',
  },
  infoItem: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '1rem',
    background: '#f9fafb',
    borderRadius: '8px',
    marginBottom: '0.75rem',
  },
  infoLabel: {
    fontWeight: 600,
    color: '#666',
  },
  infoValue: {
    color: '#333',
    textAlign: 'right',
  },
  description: {
    color: '#666',
    lineHeight: '1.8',
    fontSize: '1.05rem',
  },
  facilitiesList: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: '1rem',
  },
  facilityItem: {
    padding: '0.75rem 1rem',
    background: '#f0fdf4',
    color: '#166534',
    borderRadius: '8px',
    fontWeight: 500,
  },
};