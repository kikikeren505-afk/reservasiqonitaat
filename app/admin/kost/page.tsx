// Lokasi: app/admin/kost/page.tsx

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

export default function AdminKostPage() {
  const router = useRouter();
  const [kosts, setKosts] = useState<Kost[]>([]);
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
        alert('Akses ditolak. Halaman ini hanya untuk admin.');
        router.push('/dashboard');
        return;
      }
      
      fetchKosts();
    } catch (error) {
      console.error('Error:', error);
      router.push('/login');
    }
  }, [router]);

  const fetchKosts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/admin/kost', {
        cache: 'no-store',
      });

      console.log('Response status:', response.status);
      
      const data = await response.json();
      console.log('API Response:', data);
      
      if (response.ok && data.success) {
        // Pastikan data.data adalah array
        const kostsData = Array.isArray(data.data) ? data.data : [];
        console.log('Kosts data:', kostsData);
        setKosts(kostsData);
      } else {
        setError(data.message || 'Gagal memuat data kost');
        setKosts([]);
      }
    } catch (error) {
      console.error('Error fetching kosts:', error);
      setError('Terjadi kesalahan saat memuat data');
      setKosts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number, nama: string) => {
    if (!confirm(`Yakin ingin menghapus kost "${nama}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/kost/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok && data.success) {
        alert('Kost berhasil dihapus!');
        fetchKosts(); // Refresh data
      } else {
        alert(data.message || 'Gagal menghapus kost');
      }
    } catch (error) {
      console.error('Error deleting kost:', error);
      alert('Terjadi kesalahan saat menghapus kost');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Memuat data kost...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Kelola Kost</h1>
          <p style={styles.subtitle}>Manage semua data kost di sistem</p>
        </div>
        <a href="/admin/kost/tambah" style={styles.addBtn}>
          ➕ Tambah Kost Baru
        </a>
      </div>

      <div style={styles.backLink}>
        <a href="/admin" style={styles.link}>← Kembali ke Dashboard</a>
      </div>

      {error && (
        <div style={styles.errorAlert}>
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {kosts.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>🏘️</div>
          <h2>Belum Ada Data Kost</h2>
          <p>Tambahkan kost pertama Anda</p>
          <a href="/admin/kost/tambah" style={styles.emptyBtn}>
            Tambah Kost Baru
          </a>
        </div>
      ) : (
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>ID</th>
                <th style={styles.th}>Nama Kost</th>
                <th style={styles.th}>Alamat</th>
                <th style={styles.th}>Harga/Bulan</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {kosts && kosts.length > 0 && kosts.map((kost) => (
                <tr key={kost.id} style={styles.tr}>
                  <td style={styles.td}>{kost.id}</td>
                  <td style={styles.td}>
                    <strong>{kost.nama}</strong>
                  </td>
                  <td style={styles.td}>{kost.alamat}</td>
                  <td style={styles.td}>{formatCurrency(kost.harga)}</td>
                  <td style={styles.td}>
                    <span style={{
                      ...styles.statusBadge,
                      background: kost.status === 'tersedia' ? '#10b981' : '#6b7280'
                    }}>
                      {kost.status === 'tersedia' ? '✓ Tersedia' : '✗ Penuh'}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <div style={styles.actionBtns}>
                      <a 
                        href={`/admin/kost/${kost.id}`}
                        style={styles.viewBtn}
                      >
                        👁️ Detail
                      </a>
                      <a 
                        href={`/admin/kost/${kost.id}/edit`}
                        style={styles.editBtn}
                      >
                        ✏️ Edit
                      </a>
                      <button
                        onClick={() => handleDelete(kost.id, kost.nama)}
                        style={styles.deleteBtn}
                      >
                        🗑️ Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
  },
  title: {
    fontSize: '2rem',
    color: '#333',
    marginBottom: '0.5rem',
  },
  subtitle: {
    color: '#666',
    fontSize: '1rem',
  },
  addBtn: {
    padding: '1rem 1.5rem',
    background: '#10b981',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '8px',
    fontWeight: 600,
    transition: 'all 0.3s',
  },
  backLink: {
    marginBottom: '1.5rem',
  },
  link: {
    color: '#2563eb',
    textDecoration: 'none',
    fontWeight: 600,
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
  emptyBtn: {
    display: 'inline-block',
    marginTop: '1rem',
    padding: '1rem 2rem',
    background: '#10b981',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '8px',
    fontWeight: 600,
  },
  tableContainer: {
    background: 'white',
    borderRadius: '15px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    overflow: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  th: {
    padding: '1rem',
    textAlign: 'left',
    background: '#f9fafb',
    fontWeight: 600,
    color: '#333',
    borderBottom: '2px solid #e5e7eb',
  },
  tr: {
    borderBottom: '1px solid #e5e7eb',
  },
  td: {
    padding: '1rem',
    color: '#666',
  },
  statusBadge: {
    padding: '0.5rem 1rem',
    borderRadius: '20px',
    color: 'white',
    fontSize: '0.85rem',
    fontWeight: 600,
    display: 'inline-block',
  },
  actionBtns: {
    display: 'flex',
    gap: '0.5rem',
  },
  viewBtn: {
    padding: '0.5rem 1rem',
    background: '#2563eb',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '6px',
    fontSize: '0.85rem',
    fontWeight: 600,
  },
  editBtn: {
    padding: '0.5rem 1rem',
    background: '#f59e0b',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '6px',
    fontSize: '0.85rem',
    fontWeight: 600,
  },
  deleteBtn: {
    padding: '0.5rem 1rem',
    background: '#ef4444',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '0.85rem',
    fontWeight: 600,
    cursor: 'pointer',
  },
};