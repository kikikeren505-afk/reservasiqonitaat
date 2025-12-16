// Lokasi: app/admin/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface AdminStats {
  totalUsers: number;
  totalKost: number;
  totalReservasi: number;
  reservasiPending: number;
  reservasiConfirmed: number;
  kostTersedia: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalKost: 0,
    totalReservasi: 0,
    reservasiPending: 0,
    reservasiConfirmed: 0,
    kostTersedia: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const userData = sessionStorage.getItem('user') || localStorage.getItem('user');
    
    if (!userData) {
      router.push('/login');
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);
      
      // Check if user is admin
      if (parsedUser.role !== 'admin') {
        alert('Akses ditolak. Halaman ini hanya untuk admin.');
        router.push('/dashboard');
        return;
      }
      
      setUser(parsedUser);
      fetchAdminStats();
    } catch (error) {
      console.error('Error parsing user data:', error);
      router.push('/login');
    }
  }, [router]);

  const fetchAdminStats = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/admin/stats', {
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch admin stats');
      }

      const result = await response.json();
      
      if (result.success && result.data) {
        setStats(result.data);
      }
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      setError('Gagal memuat statistik admin');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.clear();
    localStorage.clear();
    router.push('/login');
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Memuat dashboard admin...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div style={styles.container}>
      <div style={styles.dashboardContainer}>
        {/* Sidebar */}
        <aside style={styles.sidebar}>
          <div style={styles.sidebarHeader}>
            <h2 style={styles.sidebarTitle}>Admin Panel</h2>
          </div>
          <nav style={styles.sidebarNav}>
            <a href="/admin" style={{...styles.navLink, ...styles.navLinkActive}}>
              🏠 Dashboard
            </a>
            <a href="/admin/kost" style={styles.navLink}>
              🏘️ Kelola Kost
            </a>
            <a href="/admin/reservasi" style={styles.navLink}>
              📋 Kelola Reservasi
            </a>
            <a href="/admin/users" style={styles.navLink}>
              👥 Kelola User
            </a>
            <button onClick={handleLogout} style={styles.logoutBtn}>
              🚪 Logout
            </button>
          </nav>
        </aside>

        {/* Main Content */}
        <main style={styles.mainContent}>
          {/* Welcome Card */}
          <div style={styles.welcomeCard}>
            <h1 style={styles.welcomeTitle}>
              Selamat Datang, Admin! 👋
            </h1>
            <p style={styles.welcomeText}>
              Kelola sistem reservasi kost Pondok Qonitaat dari dashboard ini.
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div style={styles.errorAlert}>
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* Stats Grid */}
          <div style={styles.statsGrid}>
            <div style={styles.statCard}>
              <div style={{...styles.statIcon, background: '#dbeafe'}}>👥</div>
              <div>
                <p style={styles.statLabel}>Total User</p>
                <h3 style={styles.statValue}>{stats.totalUsers}</h3>
              </div>
            </div>

            <div style={styles.statCard}>
              <div style={{...styles.statIcon, background: '#fef3c7'}}>🏘️</div>
              <div>
                <p style={styles.statLabel}>Total Kost</p>
                <h3 style={styles.statValue}>{stats.totalKost}</h3>
              </div>
            </div>

            <div style={styles.statCard}>
              <div style={{...styles.statIcon, background: '#d1fae5'}}>📋</div>
              <div>
                <p style={styles.statLabel}>Total Reservasi</p>
                <h3 style={styles.statValue}>{stats.totalReservasi}</h3>
              </div>
            </div>

            <div style={styles.statCard}>
              <div style={{...styles.statIcon, background: '#fed7aa'}}>⏳</div>
              <div>
                <p style={styles.statLabel}>Reservasi Pending</p>
                <h3 style={styles.statValue}>{stats.reservasiPending}</h3>
              </div>
            </div>

            <div style={styles.statCard}>
              <div style={{...styles.statIcon, background: '#d1fae5'}}>✅</div>
              <div>
                <p style={styles.statLabel}>Reservasi Confirmed</p>
                <h3 style={styles.statValue}>{stats.reservasiConfirmed}</h3>
              </div>
            </div>

            <div style={styles.statCard}>
              <div style={{...styles.statIcon, background: '#dbeafe'}}>🏠</div>
              <div>
                <p style={styles.statLabel}>Kost Tersedia</p>
                <h3 style={styles.statValue}>{stats.kostTersedia}</h3>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div style={styles.quickActions}>
            <h2 style={styles.sectionTitle}>Aksi Cepat</h2>
            <div style={styles.actionsGrid}>
              <a href="/admin/kost/tambah" style={styles.actionCard}>
                <span style={styles.actionIcon}>➕</span>
                <h3 style={styles.actionTitle}>Tambah Kost</h3>
                <p style={styles.actionDesc}>Tambahkan kost baru ke sistem</p>
              </a>

              <a href="/admin/reservasi" style={styles.actionCard}>
                <span style={styles.actionIcon}>📋</span>
                <h3 style={styles.actionTitle}>Kelola Reservasi</h3>
                <p style={styles.actionDesc}>Konfirmasi atau tolak reservasi</p>
              </a>

              <a href="/admin/kost" style={styles.actionCard}>
                <span style={styles.actionIcon}>🏘️</span>
                <h3 style={styles.actionTitle}>Kelola Kost</h3>
                <p style={styles.actionDesc}>Edit atau hapus data kost</p>
              </a>
            </div>
          </div>

          {/* Info Cards */}
          <div style={styles.infoCardsGrid}>
            <div style={styles.infoCard}>
              <h3 style={styles.infoCardTitle}>📊 Statistik Hari Ini</h3>
              <p style={styles.infoCardText}>
                Sistem berjalan normal. Tidak ada masalah yang terdeteksi.
              </p>
            </div>

            <div style={styles.infoCard}>
              <h3 style={styles.infoCardTitle}>🔔 Notifikasi</h3>
              <p style={styles.infoCardText}>
                {stats.reservasiPending > 0 
                  ? `Ada ${stats.reservasiPending} reservasi menunggu konfirmasi Anda.`
                  : 'Tidak ada reservasi yang perlu dikonfirmasi.'}
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: '100vh',
    background: '#f5f5f5',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    gap: '1rem',
  },
  spinner: {
    width: '50px',
    height: '50px',
    border: '5px solid #e5e7eb',
    borderTop: '5px solid #2563eb',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  dashboardContainer: {
    display: 'flex',
    minHeight: '100vh',
  },
  sidebar: {
    width: '280px',
    background: 'white',
    borderRight: '1px solid #e5e7eb',
    padding: '2rem 0',
    position: 'sticky',
    top: 0,
    height: '100vh',
  },
  sidebarHeader: {
    padding: '0 1.5rem',
    marginBottom: '2rem',
  },
  sidebarTitle: {
    fontSize: '1.5rem',
    color: '#dc2626',
    fontWeight: 'bold',
  },
  sidebarNav: {
    display: 'flex',
    flexDirection: 'column',
  },
  navLink: {
    padding: '1rem 1.5rem',
    color: '#666',
    textDecoration: 'none',
    transition: 'all 0.3s',
    borderLeft: '3px solid transparent',
    cursor: 'pointer',
  },
  navLinkActive: {
    background: '#fef2f2',
    color: '#dc2626',
    borderLeftColor: '#dc2626',
    fontWeight: 600,
  },
  logoutBtn: {
    margin: '1rem 1.5rem',
    padding: '0.75rem',
    background: '#ef4444',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: '1rem',
  },
  mainContent: {
    flex: 1,
    padding: '2rem',
    overflowY: 'auto',
  },
  welcomeCard: {
    background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
    color: 'white',
    padding: '2rem',
    borderRadius: '15px',
    marginBottom: '2rem',
    boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)',
  },
  welcomeTitle: {
    fontSize: '2rem',
    marginBottom: '0.5rem',
    fontWeight: 'bold',
  },
  welcomeText: {
    fontSize: '1rem',
    opacity: 0.9,
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
  statsGrid: {
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
  quickActions: {
    marginBottom: '2rem',
  },
  sectionTitle: {
    fontSize: '1.5rem',
    marginBottom: '1rem',
    color: '#333',
    fontWeight: 'bold',
  },
  actionsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '1.5rem',
  },
  actionCard: {
    background: 'white',
    padding: '2rem',
    borderRadius: '12px',
    textDecoration: 'none',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    cursor: 'pointer',
    transition: 'transform 0.3s',
  },
  actionIcon: {
    fontSize: '3rem',
    display: 'block',
    marginBottom: '1rem',
  },
  actionTitle: {
    color: '#333',
    fontSize: '1.2rem',
    marginBottom: '0.5rem',
    fontWeight: 'bold',
  },
  actionDesc: {
    color: '#666',
    fontSize: '0.9rem',
  },
  infoCardsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '1.5rem',
  },
  infoCard: {
    background: 'white',
    padding: '1.5rem',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  infoCardTitle: {
    fontSize: '1.1rem',
    color: '#333',
    marginBottom: '0.5rem',
  },
  infoCardText: {
    color: '#666',
    fontSize: '0.95rem',
  },
};