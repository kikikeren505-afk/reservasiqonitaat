// app/admin/reservasi/page.tsx - WITH DEBUG LOGS
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

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
  const [updating, setUpdating] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [isRealTimeActive, setIsRealTimeActive] = useState(false);

  const fetchReservasi = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Fetching reservasi data...');
      
      const timestamp = new Date().getTime();
      const response = await fetch(`/api/admin/reservasi?_t=${timestamp}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
        },
      });

      const data = await response.json();
      
      console.log('📊 Reservasi response:', data);
      
      if (response.ok && data.success) {
        const reservasiData = Array.isArray(data.data) ? data.data : [];
        console.log('✅ Reservasi loaded:', reservasiData.length);
        setReservasi(reservasiData);
        setLastUpdate(new Date());
      } else {
        setError(data.message || 'Gagal memuat data reservasi');
        setReservasi([]);
      }
    } catch (error) {
      console.error('❌ Error fetching reservasi:', error);
      setError('Terjadi kesalahan saat memuat data');
      setReservasi([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
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
      
      console.log('🔔 Setting up Real-time subscription...');
      
      const channel = supabase
        .channel('admin-reservasi-channel')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'reservasi'
          },
          (payload) => {
            console.log('🔥 REAL-TIME UPDATE DETECTED!', payload);
            
            if (payload.eventType === 'INSERT') {
              console.log('➕ Reservasi BARU ditambahkan!');
              showNotification('Reservasi Baru!', 'Ada reservasi baru masuk');
            } else if (payload.eventType === 'UPDATE') {
              console.log('✏️ Reservasi diupdate!');
              showNotification('Reservasi Diupdate', 'Status reservasi berubah');
            } else if (payload.eventType === 'DELETE') {
              console.log('🗑️ Reservasi dihapus!');
            }
            
            fetchReservasi();
          }
        )
        .subscribe((status) => {
          console.log('📡 Subscription status:', status);
          
          if (status === 'SUBSCRIBED') {
            console.log('✅ Real-time ACTIVE!');
            setIsRealTimeActive(true);
          } else if (status === 'CLOSED') {
            console.log('❌ Real-time CLOSED');
            setIsRealTimeActive(false);
          } else if (status === 'CHANNEL_ERROR') {
            console.error('❌ Real-time CHANNEL ERROR');
            setIsRealTimeActive(false);
          }
        });

      return () => {
        console.log('🔌 Cleaning up real-time subscription...');
        supabase.removeChannel(channel);
        setIsRealTimeActive(false);
      };
      
    } catch (error) {
      console.error('Error:', error);
      router.push('/login');
    }
  }, [router, fetchReservasi]);

  const showNotification = (title: string, body: string) => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification(title, {
          body,
          icon: '/favicon.ico',
        });
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            new Notification(title, { body });
          }
        });
      }
    }
  };

  // ✅ FUNCTION WITH DEBUG LOGS
  const handleUpdateStatus = async (id: number, newStatus: string) => {
    console.log('🔥 FUNCTION CALLED!', { 
      id, 
      newStatus, 
      timestamp: new Date().toISOString(),
      updating 
    });
    
    if (!confirm(`Ubah status reservasi menjadi "${newStatus}"?`)) {
      console.log('❌ User cancelled confirmation');
      return;
    }

    console.log('✅ User confirmed, proceeding with update...');

    if (updating) {
      console.log('⏳ Already updating, please wait...');
      return;
    }

    try {
      setUpdating(true);
      console.log(`🔄 Updating reservasi ${id} to ${newStatus}...`);
      
      const response = await fetch(`/api/admin/reservasi/${id}?nocache=${Date.now()}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();
      console.log('📡 Update response:', data);

      if (response.ok && data.success) {
        console.log('✅ Update successful!');
        console.log('🧹 Clearing all caches...');
        
        // ✅ SOLUSI NUCLEAR: Clear semua cache browser
        if ('caches' in window) {
          caches.keys().then(names => {
            console.log('🗑️ Deleting caches:', names);
            names.forEach(name => caches.delete(name));
          });
        }
        
        // Clear sessionStorage & localStorage (kecuali user data)
        const userData = sessionStorage.getItem('user') || localStorage.getItem('user');
        sessionStorage.clear();
        localStorage.clear();
        if (userData) {
          sessionStorage.setItem('user', userData);
        }
        
        console.log('✅ Cache cleared!');
        console.log('🔄 Force redirecting...');
        
        // Tunggu sebentar untuk memastikan cache terhapus
        setTimeout(() => {
          // Force redirect dengan timestamp
          window.location.href = `/admin/reservasi?cleared=true&t=${Date.now()}`;
        }, 200);
        
      } else {
        console.error('❌ Update failed:', data);
        alert('❌ ' + (data.message || 'Gagal mengupdate status'));
        setUpdating(false);
      }
    } catch (error) {
      console.error('❌ Error updating status:', error);
      alert('❌ Terjadi kesalahan saat mengupdate status');
      setUpdating(false);
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

  if (loading && reservasi.length === 0) {
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
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.75rem 1.25rem',
            background: isRealTimeActive ? '#d1fae5' : '#fee2e2',
            borderRadius: '10px',
            border: `2px solid ${isRealTimeActive ? '#10b981' : '#ef4444'}`,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <div style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              background: isRealTimeActive ? '#10b981' : '#ef4444',
              animation: isRealTimeActive ? 'pulse 2s infinite' : 'none'
            }}></div>
            <span style={{
              fontSize: '0.9rem',
              fontWeight: 700,
              color: isRealTimeActive ? '#047857' : '#dc2626'
            }}>
              {isRealTimeActive ? '🟢 Real-time Active' : '🔴 Real-time Inactive'}
            </span>
          </div>
          <span style={{ fontSize: '0.8rem', color: '#666' }}>
            📅 Update terakhir: {lastUpdate.toLocaleTimeString('id-ID')}
          </span>
          <button
            onClick={fetchReservasi}
            disabled={loading}
            style={{
              padding: '0.65rem 1.25rem',
              background: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: 600,
              fontSize: '0.9rem',
              opacity: loading ? 0.6 : 1,
              transition: 'all 0.3s'
            }}
          >
            {loading ? '⏳ Loading...' : '🔄 Refresh Manual'}
          </button>
        </div>
      </div>

      <div style={styles.backLink}>
        <a href="/admin" style={styles.link}>← Kembali ke Dashboard</a>
      </div>

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
                    <span style={styles.infoLabel}>Status Saat Ini:</span>
                    <span style={{...styles.infoValue, fontWeight: 600, color: getStatusColor(item.status)}}>
                      {item.status.toUpperCase()}
                    </span>
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
                {item.status.toLowerCase() === 'pending' ? (
                  <>
                    <strong style={{ marginBottom: '0.75rem', display: 'block' }}>Ubah Status:</strong>
                    <div style={styles.actionBtns}>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          console.log('🎯 CONFIRM BUTTON CLICKED!', { 
                            id: item.id, 
                            currentStatus: item.status,
                            targetStatus: 'confirmed'
                          });
                          handleUpdateStatus(item.id, 'confirmed');
                        }}
                        disabled={updating}
                        style={{
                          ...styles.confirmBtn,
                          cursor: updating ? 'not-allowed' : 'pointer',
                          opacity: updating ? 0.6 : 1,
                        }}
                      >
                        {updating ? '⏳ Processing...' : '✓ Konfirmasi'}
                      </button>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          console.log('🎯 CANCEL BUTTON CLICKED!', { 
                            id: item.id, 
                            currentStatus: item.status,
                            targetStatus: 'cancelled'
                          });
                          handleUpdateStatus(item.id, 'cancelled');
                        }}
                        disabled={updating}
                        style={{
                          ...styles.cancelBtn,
                          cursor: updating ? 'not-allowed' : 'pointer',
                          opacity: updating ? 0.6 : 1,
                        }}
                      >
                        {updating ? '⏳ Processing...' : '✗ Tolak'}
                      </button>
                    </div>
                  </>
                ) : item.status.toLowerCase() === 'confirmed' ? (
                  <>
                    <div style={{
                      ...styles.statusInfoBox,
                      background: '#d1fae5',
                      borderLeft: '4px solid #10b981'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <span style={{ fontSize: '1.5rem' }}>✅</span>
                        <strong style={{ color: '#065f46' }}>Reservasi Dikonfirmasi</strong>
                      </div>
                      <p style={{ fontSize: '0.85rem', color: '#047857', margin: 0 }}>
                        Reservasi ini telah dikonfirmasi dan menunggu penyelesaian.
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log('🎯 COMPLETE BUTTON CLICKED!', { 
                          id: item.id, 
                          currentStatus: item.status,
                          targetStatus: 'completed'
                        });
                        handleUpdateStatus(item.id, 'completed');
                      }}
                      disabled={updating}
                      style={{
                        ...styles.completeBtn,
                        cursor: updating ? 'not-allowed' : 'pointer',
                        opacity: updating ? 0.6 : 1,
                        marginTop: '0.75rem',
                        width: '100%'
                      }}
                    >
                      {updating ? '⏳ Processing...' : '✓ Tandai Selesai'}
                    </button>
                  </>
                ) : item.status.toLowerCase() === 'completed' ? (
                  <div style={{
                    ...styles.statusInfoBox,
                    background: '#f3f4f6',
                    borderLeft: '4px solid #6b7280'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '1.5rem' }}>✓</span>
                      <strong style={{ color: '#374151' }}>Reservasi Selesai</strong>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: '#4b5563', margin: 0 }}>
                      Reservasi ini telah selesai dan tidak dapat diubah lagi.
                    </p>
                  </div>
                ) : item.status.toLowerCase() === 'cancelled' ? (
                  <div style={{
                    ...styles.statusInfoBox,
                    background: '#fee2e2',
                    borderLeft: '4px solid #ef4444'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '1.5rem' }}>✗</span>
                      <strong style={{ color: '#991b1b' }}>Reservasi Dibatalkan</strong>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: '#dc2626', margin: 0 }}>
                      Reservasi ini telah dibatalkan dan tidak dapat diubah lagi.
                    </p>
                  </div>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}
      
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.1); }
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
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
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: '1rem',
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
    transition: 'all 0.3s',
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
    fontWeight: 'bold',
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
    marginTop: '1rem',
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
    flexWrap: 'wrap',
  },
  confirmBtn: {
    padding: '0.75rem 1.5rem',
    background: '#10b981',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 600,
    transition: 'all 0.3s',
  },
  cancelBtn: {
    padding: '0.75rem 1.5rem',
    background: '#ef4444',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 600,
    transition: 'all 0.3s',
  },
  completeBtn: {
    padding: '0.75rem 1.5rem',
    background: '#6b7280',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 600,
    transition: 'all 0.3s',
  },
  statusInfoBox: {
    padding: '1rem',
    borderRadius: '10px',
    marginBottom: '0.5rem',
  },
};