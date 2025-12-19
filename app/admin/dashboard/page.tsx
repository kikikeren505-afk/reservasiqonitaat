// Lokasi: app/admin/dashboard/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id?: number;
  user_id?: number;
  nama?: string;
  nama_lengkap?: string;
  level_id?: number;
  level_name?: string;
  role?: string;
}

interface Payment {
  id: string;
  userId: string;
  userName: string;
  kostName: string;
  amount: number;
  paymentMethod: string;
  status: 'pending' | 'confirmed' | 'rejected';
  buktiTransfer?: string;
  bookingDate: string;
  createdAt: string;
  duration: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'rejected'>('all');
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const userData = sessionStorage.getItem('user') || localStorage.getItem('user');
    
    if (!userData) {
      router.push('/login');
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);
      
      // Cek apakah user adalah admin
      const isAdmin = parsedUser.level_name === 'Admin' || 
                     parsedUser.role === 'admin' || 
                     parsedUser.level_id === 1;
      
      if (!isAdmin) {
        alert('Anda tidak memiliki akses ke halaman ini!');
        router.push('/dashboard');
        return;
      }
      
      setUser(parsedUser);
      fetchPayments();
    } catch (error) {
      console.error('Error:', error);
      router.push('/login');
    }
  }, [router]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/payments');
      const data = await response.json();
      setPayments(data);
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const updatePaymentStatus = async (paymentId: string, status: 'confirmed' | 'rejected') => {
    try {
      const response = await fetch(`/api/admin/payments/${paymentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        setPayments(prev => prev.map(p => p.id === paymentId ? { ...p, status } : p));
        setShowModal(false);
        alert(`Pembayaran ${status === 'confirmed' ? 'dikonfirmasi' : 'ditolak'}!`);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Gagal mengupdate pembayaran');
    }
  };

  const filteredPayments = payments.filter(p => filter === 'all' ? true : p.status === filter);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const handleLogout = () => {
    sessionStorage.clear();
    localStorage.clear();
    router.push('/login');
  };

  if (!user) return null;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f5f5f5' }}>
      {/* Sidebar */}
      <aside style={{ 
        position: 'fixed', 
        width: '280px', 
        height: '100vh', 
        background: 'white', 
        borderRight: '1px solid #e5e7eb',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{ padding: '2rem 1.5rem', borderBottom: '1px solid #e5e7eb' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#dc2626', margin: 0 }}>
            🏠 Admin Panel
          </h2>
        </div>
        
        <nav style={{ flex: 1, padding: '1rem 0' }}>
          <a href="/admin/dashboard" style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.75rem',
            padding: '1rem 1.5rem',
            background: '#fee2e2',
            color: '#dc2626',
            textDecoration: 'none',
            borderLeft: '3px solid #dc2626',
            fontWeight: 600
          }}>
            <span>🏠</span> Dashboard
          </a>
        </nav>
        
        <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #e5e7eb' }}>
          <button onClick={handleLogout} style={{
            width: '100%',
            padding: '0.875rem',
            background: '#dc2626',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 600,
            cursor: 'pointer'
          }}>
            🚪 Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div style={{ marginLeft: '280px', flex: 1, padding: '2rem' }}>
        {/* Welcome Card */}
        <div style={{
          background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
          color: 'white',
          padding: '2.5rem',
          borderRadius: '15px',
          marginBottom: '2rem',
        }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
            Selamat Datang, Admin! 👋
          </h1>
          <p>Kelola sistem reservasi kost dari dashboard ini</p>
        </div>

        {/* Stats */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          {[
            { icon: '👥', label: 'Total User', value: 3, bg: '#dbeafe' },
            { icon: '🏘️', label: 'Total Kost', value: 3, bg: '#d1fae5' },
            { icon: '📋', label: 'Total Reservasi', value: 2, bg: '#fef3c7' },
          ].map((stat, i) => (
            <div key={i} style={{
              background: 'white',
              padding: '1.5rem',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              <div style={{
                fontSize: '2.5rem',
                width: '60px',
                height: '60px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: stat.bg,
                borderRadius: '12px'
              }}>
                {stat.icon}
              </div>
              <div>
                <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '0.25rem' }}>{stat.label}</p>
                <h3 style={{ fontSize: '1.8rem', fontWeight: 'bold', margin: 0 }}>{stat.value}</h3>
              </div>
            </div>
          ))}
        </div>

        {/* Payment Section */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '2rem',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '2rem',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>💰 Pembayaran Masuk</h2>
            
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {[
                { key: 'all', label: `Semua (${payments.length})`, bg: '#3b82f6' },
                { key: 'pending', label: `Pending (${payments.filter(p => p.status === 'pending').length})`, bg: '#fbbf24' },
                { key: 'confirmed', label: `Konfirmasi (${payments.filter(p => p.status === 'confirmed').length})`, bg: '#10b981' },
                { key: 'rejected', label: `Ditolak (${payments.filter(p => p.status === 'rejected').length})`, bg: '#ef4444' },
              ].map(btn => (
                <button
                  key={btn.key}
                  onClick={() => setFilter(btn.key as any)}
                  style={{
                    padding: '0.75rem 1.25rem',
                    background: filter === btn.key ? btn.bg : '#f3f4f6',
                    color: filter === btn.key ? 'white' : '#666',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>Memuat data...</div>
          ) : filteredPayments.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
              Tidak ada pembayaran {filter !== 'all' ? filter : ''}
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                    <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.85rem', fontWeight: 600 }}>Tanggal</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.85rem', fontWeight: 600 }}>Penyewa</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.85rem', fontWeight: 600 }}>Kost</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.85rem', fontWeight: 600 }}>Jumlah</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.85rem', fontWeight: 600 }}>Status</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.85rem', fontWeight: 600 }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPayments.map(payment => (
                    <tr key={payment.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '1rem' }}>{formatDate(payment.createdAt)}</td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ fontWeight: 600 }}>{payment.userName}</div>
                      </td>
                      <td style={{ padding: '1rem' }}>{payment.kostName}</td>
                      <td style={{ padding: '1rem', fontWeight: 600, color: '#059669' }}>
                        {formatCurrency(payment.amount)}
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{
                          padding: '0.5rem 1rem',
                          borderRadius: '20px',
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          background: payment.status === 'pending' ? '#fef3c7' : 
                                     payment.status === 'confirmed' ? '#d1fae5' : '#fee2e2',
                          color: payment.status === 'pending' ? '#92400e' :
                                 payment.status === 'confirmed' ? '#065f46' : '#991b1b'
                        }}>
                          {payment.status === 'pending' ? 'Menunggu' : 
                           payment.status === 'confirmed' ? 'Dikonfirmasi' : 'Ditolak'}
                        </span>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <button
                          onClick={() => {
                            setSelectedPayment(payment);
                            setShowModal(true);
                          }}
                          style={{
                            padding: '0.5rem 1rem',
                            background: '#3b82f6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                        >
                          Detail
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && selectedPayment && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem'
          }}
          onClick={() => setShowModal(false)}
        >
          <div 
            style={{
              background: 'white',
              borderRadius: '12px',
              maxWidth: '600px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'auto'
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ 
              padding: '1.5rem', 
              borderBottom: '1px solid #e5e7eb',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>Detail Pembayaran</h3>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer'
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ padding: '1.5rem' }}>
              <div style={{ display: 'grid', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.25rem' }}>Penyewa</div>
                  <div style={{ fontWeight: 600 }}>{selectedPayment.userName}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.25rem' }}>Kost</div>
                  <div style={{ fontWeight: 600 }}>{selectedPayment.kostName}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.25rem' }}>Durasi</div>
                  <div style={{ fontWeight: 600 }}>{selectedPayment.duration} bulan</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.25rem' }}>Total</div>
                  <div style={{ fontWeight: 700, fontSize: '1.2rem', color: '#059669' }}>
                    {formatCurrency(selectedPayment.amount)}
                  </div>
                </div>
              </div>

              {selectedPayment.buktiTransfer && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.5rem' }}>Bukti Transfer</div>
                  <img
                    src={selectedPayment.buktiTransfer}
                    alt="Bukti"
                    style={{ width: '100%', borderRadius: '8px', border: '2px solid #e5e7eb' }}
                  />
                </div>
              )}

              {selectedPayment.status === 'pending' && (
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button
                    onClick={() => updatePaymentStatus(selectedPayment.id, 'confirmed')}
                    style={{
                      flex: 1,
                      padding: '1rem',
                      background: '#10b981',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    ✓ Konfirmasi
                  </button>
                  <button
                    onClick={() => updatePaymentStatus(selectedPayment.id, 'rejected')}
                    style={{
                      flex: 1,
                      padding: '1rem',
                      background: '#ef4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    ✗ Tolak
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}