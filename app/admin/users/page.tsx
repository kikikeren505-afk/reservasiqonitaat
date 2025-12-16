// Lokasi: app/admin/users/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: number;
  nama_lengkap: string;
  nomor_hp: string;
  alamat: string;
  email: string;
  role: string;
  created_at: string;
}

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
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
      
      fetchUsers();
    } catch (error) {
      console.error('Error:', error);
      router.push('/login');
    }
  }, [router]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/admin/users', {
        cache: 'no-store',
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        const usersData = Array.isArray(data.data) ? data.data : [];
        setUsers(usersData);
      } else {
        setError(data.message || 'Gagal memuat data users');
        setUsers([]);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Terjadi kesalahan saat memuat data');
      setUsers([]);
    } finally {
      setLoading(false);
    }
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
        <p>Memuat data users...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Kelola User</h1>
          <p style={styles.subtitle}>Manage semua pengguna sistem</p>
        </div>
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

      <div style={styles.statsCards}>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>👥</div>
          <div>
            <p style={styles.statLabel}>Total Users</p>
            <h3 style={styles.statValue}>{users.length}</h3>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={{...styles.statIcon, background: '#fef3c7'}}>👤</div>
          <div>
            <p style={styles.statLabel}>User Biasa</p>
            <h3 style={styles.statValue}>{users.filter(u => u.role === 'user').length}</h3>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={{...styles.statIcon, background: '#fee2e2'}}>🔐</div>
          <div>
            <p style={styles.statLabel}>Admin</p>
            <h3 style={styles.statValue}>{users.filter(u => u.role === 'admin').length}</h3>
          </div>
        </div>
      </div>

      {users.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>👥</div>
          <h2>Tidak Ada Data User</h2>
        </div>
      ) : (
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>ID</th>
                <th style={styles.th}>Nama</th>
                <th style={styles.th}>Email</th>
                <th style={styles.th}>Nomor HP</th>
                <th style={styles.th}>Alamat</th>
                <th style={styles.th}>Role</th>
                <th style={styles.th}>Terdaftar</th>
              </tr>
            </thead>
            <tbody>
              {users && users.length > 0 && users.map((user) => (
                <tr key={user.id} style={styles.tr}>
                  <td style={styles.td}>{user.id}</td>
                  <td style={styles.td}>
                    <strong>{user.nama_lengkap}</strong>
                  </td>
                  <td style={styles.td}>{user.email}</td>
                  <td style={styles.td}>{user.nomor_hp}</td>
                  <td style={styles.td}>{user.alamat}</td>
                  <td style={styles.td}>
                    <span style={{
                      ...styles.roleBadge,
                      background: user.role === 'admin' ? '#dc2626' : '#10b981'
                    }}>
                      {user.role === 'admin' ? '🔐 Admin' : '👤 User'}
                    </span>
                  </td>
                  <td style={styles.td}>{formatDate(user.created_at)}</td>
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
  statsCards: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '1.5rem',
    marginBottom: '2rem',
  },
  statCard: {
    background: 'white',
    padding: '1.5rem',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  statIcon: {
    fontSize: '2.5rem',
    width: '60px',
    height: '60px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '12px',
    background: '#dbeafe',
  },
  statLabel: {
    color: '#666',
    fontSize: '0.9rem',
    marginBottom: '0.25rem',
  },
  statValue: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#333',
    margin: 0,
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
  roleBadge: {
    padding: '0.5rem 1rem',
    borderRadius: '20px',
    color: 'white',
    fontSize: '0.85rem',
    fontWeight: 600,
    display: 'inline-block',
  },
};