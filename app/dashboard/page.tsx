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
  const [mounted, setMounted] = useState(false);
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
        setLoading(false);
        return;
      }
      
      fetchDashboardStats(userId);
      setTimeout(() => setMounted(true), 100);
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
      <aside style={{
        ...styles.sidebar,
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'translateX(0)' : 'translateX(-30px)',
        transition: 'all 0.8s ease-out',
      }}>
        <div style={styles.sidebarHeader}>
          <h2 style={styles.logo}>🏠 Dashboard</h2>
        </div>
        <nav style={styles.nav}>
          {[
            { href: '/dashboard', icon: '🏠', text: 'Beranda', active: true },
            { href: '/dashboard/reservasi', icon: '📋', text: 'Reservasi Saya', active: false },
            { href: '/payments', icon: '💳', text: 'Pembayaran', active: false },
            { href: '/dashboard/profile', icon: '👤', text: 'Profil', active: false },
          ].map((link, index) => (
            <a 
              key={index}
              href={link.href} 
              style={link.active ? {...styles.navLink, ...styles.navLinkActive} : styles.navLink}
              onMouseEnter={(e) => {
                if (!link.active) {
                  e.currentTarget.style.background = '#f3f4f6';
                  e.currentTarget.style.color = '#2563eb';
                }
              }}
              onMouseLeave={(e) => {
                if (!link.active) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = '#666';
                }
              }}
            >
              <span>{link.icon}</span> {link.text}
            </a>
          ))}
        </nav>
        <div style={styles.sidebarFooter}>
          <button 
            onClick={handleLogout} 
            style={styles.logoutBtn}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#dc2626';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#ef4444';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            🚪 Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div style={styles.mainWrapper}>
        <main style={styles.mainContent}>
          {error && (
            <div style={{
              ...styles.errorAlert,
              opacity: mounted ? 1 : 0,
              transform: mounted ? 'scale(1)' : 'scale(0.95)',
              transition: 'all 0.5s ease-out',
            }}>
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
          <div style={{
            ...styles.welcomeCard,
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(-20px)',
            transition: 'all 0.8s ease-out 0.2s',
          }}>
            <h1 style={styles.welcomeTitle}>Selamat Datang, {displayName}! 👋</h1>
            <p style={styles.welcomeText}>
              Kelola reservasi dan pembayaran kost Anda dengan mudah
            </p>
          </div>

          {/* Stats Overview */}
          <div style={styles.statsGrid}>
            {[
              { icon: '📋', label: 'Total Reservasi', value: stats.totalReservasi, bg: '#dbeafe', delay: '0.4s' },
              { icon: '✅', label: 'Reservasi Aktif', value: stats.reservasiAktif, bg: '#d1fae5', delay: '0.6s' },
              { icon: '🏘️', label: 'Kost Tersedia', value: stats.kostTersedia, bg: '#fef3c7', delay: '0.8s' },
            ].map((stat, index) => (
              <div 
                key={index}
                style={{
                  ...styles.statCard,
                  opacity: mounted ? 1 : 0,
                  transform: mounted ? 'translateY(0)' : 'translateY(20px)',
                  transition: `all 0.6s ease-out ${stat.delay}`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px)';
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                }}
              >
                <div style={{...styles.statIcon, background: stat.bg}}>{stat.icon}</div>
                <div>
                  <p style={styles.statLabel}>{stat.label}</p>
                  <h3 style={styles.statValue}>{stat.value}</h3>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div style={{
            ...styles.section,
            opacity: mounted ? 1 : 0,
            transition: 'all 0.8s ease-out 1s',
          }}>
            <h2 style={styles.sectionTitle}>⚡ Aksi Cepat</h2>
            <div style={styles.actionsGrid}>
              {[
                { href: '/dashboard/reservasi', icon: '📝', title: 'Lihat Reservasi', desc: 'Cek status dan detail reservasi Anda', delay: '1.2s' },
                { href: '/payments', icon: '💰', title: 'Bayar Tagihan', desc: 'Lakukan pembayaran kost Anda', delay: '1.4s' },
                { href: '/dashboard/profile', icon: '⚙️', title: 'Pengaturan Profil', desc: 'Update profil dan informasi akun', delay: '1.6s' },
              ].map((action, index) => (
                <a 
                  key={index}
                  href={action.href} 
                  style={{
                    ...styles.actionCard,
                    opacity: mounted ? 1 : 0,
                    transform: mounted ? 'scale(1)' : 'scale(0.95)',
                    transition: `all 0.6s ease-out ${action.delay}`,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-8px)';
                    e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                  }}
                >
                  <span style={styles.actionIcon}>{action.icon}</span>
                  <h3 style={styles.actionTitle}>{action.title}</h3>
                  <p style={styles.actionDesc}>{action.desc}</p>
                </a>
              ))}
            </div>
          </div>

          {/* User Info */}
          <div style={{
            ...styles.section,
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(20px)',
            transition: 'all 0.8s ease-out 1.8s',
          }}>
            <h2 style={styles.sectionTitle}>📋 Informasi Akun</h2>
            <div style={styles.infoCard}>
              <div style={styles.infoGrid}>
                {[
                  { label: '👤 Nama:', value: displayName },
                  { label: '📱 No. HP:', value: displayPhone },
                  { label: '📍 Alamat:', value: user.alamat },
                  { label: '🏷️ Status:', value: displayRole, isBadge: true },
                ].map((info, index) => (
                  <div key={index} style={styles.infoItem}>
                    <span style={styles.infoLabel}>{info.label}</span>
                    <span style={info.isBadge ? {...styles.infoValue, ...styles.statusBadge} : styles.infoValue}>
                      {info.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Tips Section */}
          <div style={{
            ...styles.section,
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'scale(1)' : 'scale(0.98)',
            transition: 'all 0.8s ease-out 2s',
          }}>
            <h2 style={styles.sectionTitle}>💡 Tips & Informasi</h2>
            <div style={styles.tipsCard}>
              <ul style={styles.tipsList}>
                {[
                  { title: 'Verifikasi Dokumen:', text: 'Pastikan dokumen identitas Anda sudah lengkap untuk mempercepat proses reservasi' },
                  { title: 'Pembayaran:', text: 'Lakukan pembayaran sebelum batas waktu yang ditentukan agar reservasi tidak dibatalkan' },
                  { title: 'Komunikasi:', text: 'Jangan ragu menghubungi kami jika ada pertanyaan atau kendala' },
                ].map((tip, index) => (
                  <li key={index} style={styles.tipItem}>
                    <strong>{tip.title}</strong> {tip.text}
                  </li>
                ))}
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
    transition: 'all 0.3s ease',
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
    transition: 'all 0.3s ease',
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
    transition: 'all 0.3s ease',
    cursor: 'pointer',
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
    transition: 'all 0.3s ease',
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