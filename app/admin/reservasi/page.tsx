'use client';

import { useEffect, useState } from 'react';

interface Reservasi {
  id: number;
  user_id: string;
  kost_id: number;
  tanggal_mulai: string;
  tanggal_selesai: string;
  durasi_bulan: number;
  total_harga: number;
  status: string;
  catatan: string | null;
  created_at: string;
  pembayaran: string | null;
  keterangan: string | null;
  bukti_pembayaran: string | null;
  users: {
    email: string;
    nama_lengkap: string;
  } | null;
  kost: {
    nama: string;
    harga: number;
    alamat: string;
    alamat_kost: string;
  } | null;
}

export default function AdminReservasiPage() {
  const [reservasi, setReservasi] = useState<Reservasi[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('semua');
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const fetchReservasi = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/reservasi', {
        cache: 'no-store',
      });
      
      if (!response.ok) throw new Error('Failed to fetch');
      
      const data = await response.json();
      
      if (data.success) {
        setReservasi(data.data);
        setLastUpdate(new Date());
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservasi();
    const interval = setInterval(fetchReservasi, 30000);
    return () => clearInterval(interval);
  }, []);

  const filteredReservasi = reservasi.filter(r => {
    if (filter === 'semua') return true;
    return r.status === filter;
  });

  const counts = {
    semua: reservasi.length,
    pending: reservasi.filter(r => r.status === 'pending').length,
    confirmed: reservasi.filter(r => r.status === 'confirmed').length,
    completed: reservasi.filter(r => r.status === 'completed').length,
    cancelled: reservasi.filter(r => r.status === 'cancelled').length,
  };

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const StatusBadge = ({ status }: { status: string }) => {
    const colors = {
      pending: '#f59e0b',
      confirmed: '#3b82f6',
      completed: '#10b981',
      cancelled: '#ef4444',
    };

    return (
      <span style={{
        backgroundColor: colors[status as keyof typeof colors],
        color: 'white',
        padding: '6px 16px',
        borderRadius: '20px',
        fontSize: '14px',
        fontWeight: '600',
      }}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (loading && reservasi.length === 0) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#f9fafb',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '3px solid #e5e7eb',
            borderTop: '3px solid #2563eb',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto'
          }}></div>
          <p style={{ marginTop: '16px', color: '#6b7280' }}>Memuat data...</p>
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f9fafb',
      padding: '32px'
    }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'flex-start',
            marginBottom: '24px',
            flexWrap: 'wrap',
            gap: '16px'
          }}>
            <div>
              <h1 style={{ 
                fontSize: '36px', 
                fontWeight: 'bold', 
                color: '#111827',
                marginBottom: '8px'
              }}>
                Kelola Reservasi
              </h1>
              <p style={{ color: '#6b7280', marginBottom: '12px' }}>
                Manage semua reservasi pengguna
              </p>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px',
                marginBottom: '8px'
              }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px',
                  padding: '8px 16px',
                  backgroundColor: '#d1fae5',
                  borderRadius: '8px',
                  border: '2px solid #10b981'
                }}>
                  <div style={{ 
                    width: '8px', 
                    height: '8px', 
                    backgroundColor: '#10b981', 
                    borderRadius: '50%',
                    animation: 'pulse 2s infinite'
                  }}></div>
                  <div style={{ 
                    width: '8px', 
                    height: '8px', 
                    backgroundColor: '#10b981', 
                    borderRadius: '50%',
                    animation: 'pulse 2s infinite',
                    animationDelay: '0.5s'
                  }}></div>
                  <span style={{ 
                    color: '#059669', 
                    fontWeight: '600',
                    fontSize: '14px'
                  }}>
                    Real-time Active
                  </span>
                </div>
              </div>
              <p style={{ fontSize: '13px', color: '#9ca3af' }}>
                📅 Update terakhir: {lastUpdate.toLocaleTimeString('id-ID')}
              </p>
            </div>
            
            <button
              onClick={fetchReservasi}
              disabled={loading}
              style={{
                padding: '12px 24px',
                backgroundColor: loading ? '#9ca3af' : '#2563eb',
                color: 'white',
                borderRadius: '8px',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontWeight: '600',
                fontSize: '14px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                transition: 'all 0.3s'
              }}
              onMouseOver={(e) => {
                if (!loading) e.currentTarget.style.backgroundColor = '#1d4ed8';
              }}
              onMouseOut={(e) => {
                if (!loading) e.currentTarget.style.backgroundColor = '#2563eb';
              }}
            >
              🔄 Refresh Manual
            </button>
          </div>

          <button
            onClick={() => window.history.back()}
            style={{
              color: '#2563eb',
              fontWeight: '500',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              fontSize: '14px',
              marginBottom: '24px'
            }}
          >
            ← Kembali ke Dashboard
          </button>
        </div>

        {/* Filter Tabs */}
        <div style={{ 
          display: 'flex', 
          gap: '12px', 
          marginBottom: '32px',
          flexWrap: 'wrap'
        }}>
          {[
            { key: 'semua', label: 'Semua', count: counts.semua },
            { key: 'pending', label: 'Pending', count: counts.pending },
            { key: 'confirmed', label: 'Confirmed', count: counts.confirmed },
            { key: 'completed', label: 'Completed', count: counts.completed },
            { key: 'cancelled', label: 'Cancelled', count: counts.cancelled },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              style={{
                padding: '10px 24px',
                backgroundColor: filter === tab.key ? '#dc2626' : 'white',
                color: filter === tab.key ? 'white' : '#374151',
                border: filter === tab.key ? 'none' : '1px solid #d1d5db',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '14px',
                boxShadow: filter === tab.key ? '0 4px 6px rgba(220,38,38,0.3)' : 'none',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => {
                if (filter !== tab.key) {
                  e.currentTarget.style.backgroundColor = '#f9fafb';
                }
              }}
              onMouseOut={(e) => {
                if (filter !== tab.key) {
                  e.currentTarget.style.backgroundColor = 'white';
                }
              }}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* Reservasi List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {filteredReservasi.length === 0 ? (
            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '48px',
              textAlign: 'center',
              color: '#6b7280',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              Tidak ada reservasi dengan status "{filter}"
            </div>
          ) : (
            filteredReservasi.map((item) => (
              <div key={item.id} style={{
                backgroundColor: 'white',
                borderRadius: '16px',
                padding: '32px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                border: '1px solid #e5e7eb',
                transition: 'box-shadow 0.3s'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.15)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
              }}>
                {/* Header Card */}
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'flex-start',
                  marginBottom: '24px',
                  flexWrap: 'wrap',
                  gap: '16px'
                }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ 
                      fontSize: '24px', 
                      fontWeight: 'bold', 
                      color: '#111827',
                      marginBottom: '16px'
                    }}>
                      {item.kost?.nama || 'Kost tidak ditemukan'}
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '18px' }}>👤</span>
                        <span style={{ fontWeight: '600', color: '#1f2937' }}>
                          {item.users?.nama_lengkap || 'Nama tidak tersedia'}
                        </span>
                        <span style={{ color: '#6b7280', fontSize: '14px' }}>
                          ({item.users?.email || 'Email tidak tersedia'})
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '18px' }}>📍</span>
                        <span style={{ color: '#4b5563', fontSize: '14px' }}>
                          {item.kost?.alamat || item.kost?.alamat_kost || 'Alamat tidak tersedia'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <StatusBadge status={item.status} />
                </div>

                <div style={{
                  textTransform: 'uppercase',
                  fontSize: '13px',
                  fontWeight: 'bold',
                  color: '#111827',
                  marginBottom: '16px',
                  letterSpacing: '0.5px'
                }}>
                  {item.status}
                </div>

                {/* Detail Grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '24px',
                  padding: '24px 0',
                  borderTop: '1px solid #e5e7eb',
                  borderBottom: '1px solid #e5e7eb'
                }}>
                  <div>
                    <p style={{ 
                      fontSize: '13px', 
                      color: '#6b7280', 
                      marginBottom: '4px',
                      fontWeight: '500'
                    }}>
                      ID Reservasi:
                    </p>
                    <p style={{ fontWeight: 'bold', color: '#111827', fontSize: '18px' }}>
                      #{item.id}
                    </p>
                  </div>
                  <div>
                    <p style={{ 
                      fontSize: '13px', 
                      color: '#6b7280', 
                      marginBottom: '4px',
                      fontWeight: '500'
                    }}>
                      Status Saat Ini:
                    </p>
                    <p style={{ 
                      fontWeight: 'bold', 
                      color: '#f59e0b', 
                      fontSize: '18px',
                      textTransform: 'uppercase'
                    }}>
                      {item.status}
                    </p>
                  </div>
                  <div>
                    <p style={{ 
                      fontSize: '13px', 
                      color: '#6b7280', 
                      marginBottom: '4px',
                      fontWeight: '500'
                    }}>
                      Durasi:
                    </p>
                    <p style={{ fontWeight: 'bold', color: '#111827', fontSize: '18px' }}>
                      {item.durasi_bulan} Bulan
                    </p>
                  </div>
                  <div>
                    <p style={{ 
                      fontSize: '13px', 
                      color: '#6b7280', 
                      marginBottom: '4px',
                      fontWeight: '500'
                    }}>
                      Total Harga:
                    </p>
                    <p style={{ fontWeight: 'bold', color: '#111827', fontSize: '18px' }}>
                      {formatRupiah(item.total_harga)}
                    </p>
                  </div>
                </div>

                {/* Tanggal Info */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: '24px',
                  marginTop: '24px'
                }}>
                  <div>
                    <p style={{ 
                      fontSize: '13px', 
                      color: '#6b7280', 
                      marginBottom: '4px',
                      fontWeight: '500'
                    }}>
                      Tanggal Mulai:
                    </p>
                    <p style={{ fontWeight: '600', color: '#111827' }}>
                      {formatDate(item.tanggal_mulai)}
                    </p>
                  </div>
                  <div>
                    <p style={{ 
                      fontSize: '13px', 
                      color: '#6b7280', 
                      marginBottom: '4px',
                      fontWeight: '500'
                    }}>
                      Tanggal Selesai:
                    </p>
                    <p style={{ fontWeight: '600', color: '#111827' }}>
                      {formatDate(item.tanggal_selesai)}
                    </p>
                  </div>
                  <div>
                    <p style={{ 
                      fontSize: '13px', 
                      color: '#6b7280', 
                      marginBottom: '4px',
                      fontWeight: '500'
                    }}>
                      Tanggal Booking:
                    </p>
                    <p style={{ fontWeight: '600', color: '#111827' }}>
                      {formatDate(item.created_at)}
                    </p>
                  </div>
                </div>

                {/* Catatan */}
                {item.catatan && (
                  <div style={{
                    marginTop: '24px',
                    padding: '16px',
                    backgroundColor: '#dbeafe',
                    borderRadius: '8px',
                    border: '1px solid #93c5fd'
                  }}>
                    <p style={{ 
                      fontSize: '13px', 
                      color: '#1e40af', 
                      marginBottom: '4px',
                      fontWeight: '600'
                    }}>
                      Catatan:
                    </p>
                    <p style={{ color: '#1e3a8a' }}>{item.catatan}</p>
                  </div>
                )}

                {/* Bukti Pembayaran */}
                {item.bukti_pembayaran && (
                  <div style={{ marginTop: '16px' }}>
                    <a
                      href={item.bukti_pembayaran}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        color: '#2563eb',
                        fontWeight: '500',
                        textDecoration: 'underline',
                        fontSize: '14px'
                      }}
                    >
                      📎 Lihat Bukti Transfer
                    </a>
                  </div>
                )}

                {/* Action Buttons */}
                <div style={{
                  marginTop: '24px',
                  paddingTop: '24px',
                  borderTop: '1px solid #e5e7eb',
                  display: 'flex',
                  gap: '12px',
                  flexWrap: 'wrap'
                }}>
                  {item.status === 'pending' && (
                    <>
                      <button
                        onClick={async () => {
                          if (confirm('Konfirmasi reservasi ini?')) {
                            try {
                              const response = await fetch(`/api/reservasi/${item.id}`, {
                                method: 'PATCH',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ status: 'confirmed' }),
                              });
                              if (response.ok) {
                                alert('Reservasi berhasil dikonfirmasi!');
                                fetchReservasi();
                              } else {
                                alert('Gagal mengkonfirmasi reservasi');
                              }
                            } catch (error) {
                              console.error('Error:', error);
                              alert('Terjadi kesalahan');
                            }
                          }
                        }}
                        style={{
                          padding: '12px 24px',
                          backgroundColor: '#10b981',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          fontWeight: '600',
                          fontSize: '14px',
                          cursor: 'pointer',
                          boxShadow: '0 2px 4px rgba(16,185,129,0.3)',
                          transition: 'all 0.2s'
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.backgroundColor = '#059669';
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 4px 8px rgba(16,185,129,0.4)';
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.backgroundColor = '#10b981';
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 2px 4px rgba(16,185,129,0.3)';
                        }}
                      >
                        ✅ Konfirmasi
                      </button>
                      <button
                        onClick={async () => {
                          const reason = prompt('Alasan penolakan (opsional):');
                          if (reason !== null) {
                            if (confirm('Tolak reservasi ini?')) {
                              try {
                                const response = await fetch(`/api/reservasi/${item.id}`, {
                                  method: 'PATCH',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ 
                                    status: 'cancelled',
                                    keterangan: reason || 'Ditolak oleh admin'
                                  }),
                                });
                                if (response.ok) {
                                  alert('Reservasi berhasil ditolak!');
                                  fetchReservasi();
                                } else {
                                  alert('Gagal menolak reservasi');
                                }
                              } catch (error) {
                                console.error('Error:', error);
                                alert('Terjadi kesalahan');
                              }
                            }
                          }
                        }}
                        style={{
                          padding: '12px 24px',
                          backgroundColor: '#ef4444',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          fontWeight: '600',
                          fontSize: '14px',
                          cursor: 'pointer',
                          boxShadow: '0 2px 4px rgba(239,68,68,0.3)',
                          transition: 'all 0.2s'
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.backgroundColor = '#dc2626';
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 4px 8px rgba(239,68,68,0.4)';
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.backgroundColor = '#ef4444';
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 2px 4px rgba(239,68,68,0.3)';
                        }}
                      >
                        ❌ Tolak
                      </button>
                    </>
                  )}

                  {item.status === 'confirmed' && (
                    <button
                      onClick={async () => {
                        if (confirm('Tandai reservasi ini sebagai selesai?')) {
                          try {
                            const response = await fetch(`/api/reservasi/${item.id}`, {
                              method: 'PATCH',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ status: 'completed' }),
                            });
                            if (response.ok) {
                              alert('Reservasi berhasil diselesaikan!');
                              fetchReservasi();
                            } else {
                              alert('Gagal menyelesaikan reservasi');
                            }
                          } catch (error) {
                            console.error('Error:', error);
                            alert('Terjadi kesalahan');
                          }
                        }
                      }}
                      style={{
                        padding: '12px 24px',
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontWeight: '600',
                        fontSize: '14px',
                        cursor: 'pointer',
                        boxShadow: '0 2px 4px rgba(59,130,246,0.3)',
                        transition: 'all 0.2s'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.backgroundColor = '#2563eb';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 4px 8px rgba(59,130,246,0.4)';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.backgroundColor = '#3b82f6';
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 2px 4px rgba(59,130,246,0.3)';
                      }}
                    >
                      ✔️ Selesaikan
                    </button>
                  )}

                  {(item.status === 'completed' || item.status === 'cancelled') && (
                    <div style={{
                      padding: '12px 24px',
                      backgroundColor: '#f3f4f6',
                      color: '#6b7280',
                      borderRadius: '8px',
                      fontWeight: '600',
                      fontSize: '14px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      {item.status === 'completed' ? '✅ Selesai' : '🚫 Dibatalkan'}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </div>
  );
}