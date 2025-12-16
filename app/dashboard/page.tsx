// Lokasi: app/dashboard/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id?: number;
  user_id?: number;
  nama?: string;
  nama_lengkap?: string;
  alamat: string;
  no_hp?: string;
  nomor_hp?: string;
  level_id?: number;
  level_name?: string;
  role?: string;
  email?: string;
}

interface DashboardStats {
  totalReservasi: number;
  reservasiAktif: number;
  kostTersedia: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalReservasi: 0,
    reservasiAktif: 0,
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
      setUser(parsedUser);
      
      const userId = parsedUser.id || parsedUser.user_id;
      
      if (!userId) {
        setError('User ID tidak ditemukan. Silakan login kembali.');
        return;
      }
      
      fetchDashboardStats(userId);
    } catch (error) {
      console.error('Error parsing user data:', error);
      router.push('/login');
    }
  }, [router]);

  const fetchDashboardStats = async (userId: number) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/dashboard/stats?user_id=${userId}`, {
        cache: 'no-store',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch dashboard statistics');
      }

      const result = await response.json();
      
      if (result.success && result.data) {
        setStats(result.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      setError('Gagal memuat statistik dashboard.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.clear();
    localStorage.clear();
    router.push('/login');
  };

  const handleRetry = () => {
    if (user) {
      const userId = user.id || user.user_id;
      if (userId) {
        fetchDashboardStats(userId);
      }
    }
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Memuat dashboard...</p>
      </div>
    );
  }

  if (!user) return null;

  const displayName = user.nama || user.nama_lengkap || 'User';
  const displayPhone = user.no_hp || user.nomor_hp || '-';
  const displayRole = user.level_name || user.role || 'User';

  return (
    <div style={styles.pageWrapper}>
      {/* Fixed Sidebar */}
      <aside style={styles.sidebar}>
        <div style={styles.sidebarHeader}>
          <h2 style={styles.logo}>🏠 Dashboard</h2>
        </div>
        <nav style={styles.nav}>
          <a href="/dashboard" style={{...styles.navLink, ...styles.navLinkActive}}>
            <span>🏠</span> Beranda
          </a>
          <a href="/dashboard/reservasi" style={styles.navLink}>
            <span>📋</span> Reservasi Saya
          </a>
          <a href="/payments" style={styles.navLink}>
            <span>💳</span> Pembayaran
          </a>
          <a href="/dashboard/profile" style={styles.navLink}>
            <span>👤</span> Profil
          </a>
        </nav>
        <div style={styles.sidebarFooter}>
          <button onClick={handleLogout} style={styles.logoutBtn}>
            🚪 Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div style={styles.mainWrapper}>
        <main style={styles.mainContent}>
          {error && (
            <div style={styles.errorAlert}>
              <span>⚠️</span>
              <div>
                <strong>Error:</strong> {error}
              </div>
              <button onClick={handleRetry} style={styles.retryBtn}>
                Coba Lagi
              </button>
            </div>
          )}

          {/* Welcome Card */}
          <div style={styles.welcomeCard}>
            <h1 style={styles.welcomeTitle}>Selamat Datang, {displayName}! 👋</h1>
            <p style={styles.welcomeText}>
              Kelola reservasi dan pembayaran kost Anda dengan mudah
            </p>
          </div>

          {/* Stats Overview */}
          <div style={styles.statsGrid}>
            <div style={styles.statCard}>
              <div style={{...styles.statIcon, background: '#dbeafe'}}>📋</div>
              <div>
                <p style={styles.statLabel}>Total Reservasi</p>
                <h3 style={styles.statValue}>{stats.totalReservasi}</h3>
              </div>
            </div>

            <div style={styles.statCard}>
              <div style={{...styles.statIcon, background: '#d1fae5'}}>✅</div>
              <div>
                <p style={styles.statLabel}>Reservasi Aktif</p>
                <h3 style={styles.statValue}>{stats.reservasiAktif}</h3>
              </div>
            </div>

            <div style={styles.statCard}>
              <div style={{...styles.statIcon, background: '#fef3c7'}}>🏘️</div>
              <div>
                <p style={styles.statLabel}>Kost Tersedia</p>
                <h3 style={styles.statValue}>{stats.kostTersedia}</h3>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>⚡ Aksi Cepat</h2>
            <div style={styles.actionsGrid}>
              <a href="/dashboard/reservasi" style={styles.actionCard}>
                <span style={styles.actionIcon}>📝</span>
                <h3 style={styles.actionTitle}>Lihat Reservasi</h3>
                <p style={styles.actionDesc}>Cek status dan detail reservasi Anda</p>
              </a>

              <a href="/payments" style={styles.actionCard}>
                <span style={styles.actionIcon}>💰</span>
                <h3 style={styles.actionTitle}>Bayar Tagihan</h3>
                <p style={styles.actionDesc}>Lakukan pembayaran kost Anda</p>
              </a>

              <a href="/dashboard/profile" style={styles.actionCard}>
                <span style={styles.actionIcon}>⚙️</span>
                <h3 style={styles.actionTitle}>Pengaturan Profil</h3>
                <p style={styles.actionDesc}>Update profil dan informasi akun</p>
              </a>
            </div>
          </div>

          {/* User Info */}
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>📋 Informasi Akun</h2>
            <div style={styles.infoCard}>
              <div style={styles.infoGrid}>
                <div style={styles.infoItem}>
                  <span style={styles.infoLabel}>👤 Nama:</span>
                  <span style={styles.infoValue}>{displayName}</span>
                </div>
                <div style={styles.infoItem}>
                  <span style={styles.infoLabel}>📱 No. HP:</span>
                  <span style={styles.infoValue}>{displayPhone}</span>
                </div>
                <div style={styles.infoItem}>
                  <span style={styles.infoLabel}>📍 Alamat:</span>
                  <span style={styles.infoValue}>{user.alamat}</span>
                </div>
                <div style={styles.infoItem}>
                  <span style={styles.infoLabel}>🏷️ Status:</span>
                  <span style={{...styles.infoValue, ...styles.statusBadge}}>
                    {displayRole}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Tips Section */}
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>💡 Tips & Informasi</h2>
            <div style={styles.tipsCard}>
              <ul style={styles.tipsList}>
                <li style={styles.tipItem}>
                  <strong>Verifikasi Dokumen:</strong> Pastikan dokumen identitas Anda sudah lengkap untuk mempercepat proses reservasi
                </li>
                <li style={styles.tipItem}>
                  <strong>Pembayaran:</strong> Lakukan pembayaran sebelum batas waktu yang ditentukan agar reservasi tidak dibatalkan
                </li>
                <li style={styles.tipItem}>
                  <strong>Komunikasi:</strong> Jangan ragu menghubungi kami jika ada pertanyaan atau kendala
                </li>
              </ul>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  pageWrapper: {
    display: 'flex',
    minHeight: '100vh',
    background: '#f5f5f5',
  },
  sidebar: {
    position: 'fixed',
    left: 0,
    top: 0,
    width: '280px',
    height: '100vh',
    background: 'white',
    borderRight: '1px solid #e5e7eb',
    display: 'flex',
    flexDirection: 'column',
    zIndex: 100,
  },
  sidebarHeader: {
    padding: '2rem 1.5rem',
    borderBottom: '1px solid #e5e7eb',
  },
  logo: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#2563eb',
    margin: 0,
  },
  nav: {
    flex: 1,
    padding: '1rem 0',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  navLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '1rem 1.5rem',
    color: '#666',
    textDecoration: 'none',
    transition: 'all 0.3s',
    borderLeft: '3px solid transparent',
  },
  navLinkActive: {
    background: '#eff6ff',
    color: '#2563eb',
    borderLeftColor: '#2563eb',
    fontWeight: 600,
  },
  sidebarFooter: {
    padding: '1rem 1.5rem',
    borderTop: '1px solid #e5e7eb',
  },
  logoutBtn: {
    width: '100%',
    padding: '0.875rem',
    background: '#ef4444',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.3s',
  },
  mainWrapper: {
    marginLeft: '280px',
    flex: 1,
    width: 'calc(100% - 280px)',
  },
  mainContent: {
    padding: '2rem',
    maxWidth: '1400px',
    margin: '0 auto',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
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
  retryBtn: {
    marginLeft: 'auto',
    padding: '0.5rem 1rem',
    background: '#dc2626',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 600,
  },
  welcomeCard: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    padding: '2.5rem',
    borderRadius: '15px',
    marginBottom: '2rem',
    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
  },
  welcomeTitle: {
    fontSize: '2rem',
    fontWeight: 'bold',
    marginBottom: '0.5rem',
  },
  welcomeText: {
    fontSize: '1rem',
    opacity: 0.9,
  },
  section: {
    marginBottom: '2rem',
  },
  sectionTitle: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '1.5rem',
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
    transition: 'all 0.3s',
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
    fontSize: '1.8rem',
    fontWeight: 'bold',
    color: '#333',
    margin: 0,
  },
  actionsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '1.5rem',
  },
  actionCard: {
    background: 'white',
    padding: '2rem',
    borderRadius: '12px',
    textDecoration: 'none',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    transition: 'all 0.3s',
    display: 'block',
    cursor: 'pointer',
  },
  actionIcon: {
    fontSize: '3rem',
    display: 'block',
    marginBottom: '1rem',
  },
  actionTitle: {
    fontSize: '1.2rem',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '0.5rem',
  },
  actionDesc: {
    fontSize: '0.9rem',
    color: '#666',
    lineHeight: '1.5',
  },
  infoCard: {
    background: 'white',
    padding: '2rem',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  infoGrid: {
    display: 'grid',
    gap: '1rem',
  },
  infoItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem',
    background: '#f9fafb',
    borderRadius: '8px',
  },
  infoLabel: {
    fontWeight: 600,
    color: '#666',
  },
  infoValue: {
    color: '#333',
    textAlign: 'right',
    fontWeight: 500,
  },
  statusBadge: {
    background: '#10b981',
    color: 'white',
    padding: '0.25rem 0.75rem',
    borderRadius: '12px',
    fontSize: '0.85rem',
    fontWeight: 600,
  },
  tipsCard: {
    background: 'white',
    padding: '2rem',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  tipsList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
  },
  tipItem: {
    padding: '1rem',
    background: '#fffbeb',
    borderLeft: '4px solid #f59e0b',
    marginBottom: '1rem',
    borderRadius: '8px',
    color: '#78350f',
    lineHeight: '1.6',
  },
};