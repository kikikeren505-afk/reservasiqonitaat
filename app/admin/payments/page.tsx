// Lokasi: app/admin/payments/page.tsx
// ✅ PERUBAHAN: Update status dari 'confirmed' menjadi 'verified' sesuai database

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Payment {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  kostName: string;
  amount: number;
  paymentMethod: string;
  status: 'pending' | 'verified' | 'rejected'; // ✅ UBAH dari 'confirmed' ke 'verified'
  buktiTransfer?: string;
  namaPengirim?: string;
  namaRekening?: string;
  tanggalTransfer?: string;
  bookingDate: string;
  createdAt: string;
  duration: number;
  catatanAdmin?: string;
  reservasiId?: number;
}

export default function PaymentsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'verified' | 'rejected'>('all');
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [catatan, setCatatan] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
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
      
      setUser(parsedUser);
      fetchPayments();
    } catch (error) {
      console.error('Error parsing user data:', error);
      router.push('/login');
    }
  }, [router]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/payments', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch payments');
      }
      
      const data = await response.json();
      console.log('Payments loaded:', data);
      setPayments(data);
    } catch (error) {
      console.error('Error fetching payments:', error);
      alert('Gagal memuat data pembayaran');
    } finally {
      setLoading(false);
    }
  };

  const updatePaymentStatus = async (paymentId: string, status: 'verified' | 'rejected') => {
    if (updating) return;
    
    try {
      setUpdating(true);
      const response = await fetch(`/api/admin/payments/${paymentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status,
          catatan_admin: catatan || null
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(`Pembayaran berhasil ${status === 'verified' ? 'dikonfirmasi' : 'ditolak'}!`);
        setShowModal(false);
        setCatatan('');
        
        // Refresh data dan router
        router.refresh();
        await fetchPayments();
      } else {
        alert(data.message || 'Gagal mengupdate pembayaran');
      }
    } catch (error) {
      console.error('Error updating payment:', error);
      alert('Gagal mengupdate pembayaran');
    } finally {
      setUpdating(false);
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
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleLogout = () => {
    sessionStorage.clear();
    localStorage.clear();
    router.push('/login');
  };

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
            <a href="/admin" style={styles.navLink}>
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
            <a href="/admin/payments" style={{...styles.navLink, ...styles.navLinkActive}}>
              💰 Pembayaran
            </a>
            <button onClick={handleLogout} style={styles.logoutBtn}>
              🚪 Logout
            </button>
          </nav>
        </aside>

        {/* Main Content */}
        <main style={styles.mainContent}>
          {/* Header */}
          <div style={styles.header}>
            <div>
              <h1 style={styles.pageTitle}>💰 Pembayaran Masuk</h1>
              <p style={styles.pageSubtitle}>Kelola dan konfirmasi pembayaran dari penyewa</p>
            </div>
          </div>

          {/* Payment Section */}
          <div style={styles.paymentSection}>
            <div style={styles.paymentHeader}>
              <div style={styles.filterButtons}>
                <button
                  onClick={() => setFilter('all')}
                  style={{
                    ...styles.filterBtn,
                    background: filter === 'all' ? '#3b82f6' : '#f3f4f6',
                    color: filter === 'all' ? 'white' : '#666',
                  }}
                >
                  Semua ({payments.length})
                </button>
                <button
                  onClick={() => setFilter('pending')}
                  style={{
                    ...styles.filterBtn,
                    background: filter === 'pending' ? '#fbbf24' : '#f3f4f6',
                    color: filter === 'pending' ? 'white' : '#666',
                  }}
                >
                  Pending ({payments.filter(p => p.status === 'pending').length})
                </button>
                <button
                  onClick={() => setFilter('verified')}
                  style={{
                    ...styles.filterBtn,
                    background: filter === 'verified' ? '#10b981' : '#f3f4f6',
                    color: filter === 'verified' ? 'white' : '#666',
                  }}
                >
                  Dikonfirmasi ({payments.filter(p => p.status === 'verified').length})
                </button>
                <button
                  onClick={() => setFilter('rejected')}
                  style={{
                    ...styles.filterBtn,
                    background: filter === 'rejected' ? '#ef4444' : '#f3f4f6',
                    color: filter === 'rejected' ? 'white' : '#666',
                  }}
                >
                  Ditolak ({payments.filter(p => p.status === 'rejected').length})
                </button>
              </div>
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '3rem' }}>
                <div style={styles.spinner}></div>
                <p>Memuat data pembayaran...</p>
              </div>
            ) : filteredPayments.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
                <p style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</p>
                <p>Tidak ada pembayaran {filter !== 'all' ? filter : ''}</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={styles.table}>
                  <thead>
                    <tr style={styles.tableHeader}>
                      <th style={styles.th}>Tanggal</th>
                      <th style={styles.th}>Penyewa</th>
                      <th style={styles.th}>Kost</th>
                      <th style={styles.th}>Durasi</th>
                      <th style={styles.th}>Jumlah</th>
                      <th style={styles.th}>Metode</th>
                      <th style={styles.th}>Status</th>
                      <th style={styles.th}>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPayments.map((payment) => (
                      <tr key={payment.id} style={styles.tableRow}>
                        <td style={styles.td}>{formatDate(payment.createdAt)}</td>
                        <td style={styles.td}>
                          <div style={{ fontWeight: 600 }}>{payment.userName}</div>
                          <div style={{ fontSize: '0.85rem', color: '#666' }}>ID: {payment.userId}</div>
                        </td>
                        <td style={styles.td}>{payment.kostName}</td>
                        <td style={styles.td}>{payment.duration} bulan</td>
                        <td style={{ ...styles.td, fontWeight: 600, color: '#059669' }}>
                          {formatCurrency(payment.amount)}
                        </td>
                        <td style={styles.td}>{payment.paymentMethod}</td>
                        <td style={styles.td}>
                          <span style={{
                            padding: '0.5rem 1rem',
                            borderRadius: '20px',
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            background: payment.status === 'pending' ? '#fef3c7' : 
                                       payment.status === 'verified' ? '#d1fae5' : '#fee2e2',
                            color: payment.status === 'pending' ? '#92400e' :
                                   payment.status === 'verified' ? '#065f46' : '#991b1b'
                          }}>
                            {payment.status === 'pending' ? 'Menunggu' : 
                             payment.status === 'verified' ? 'Dikonfirmasi' : 'Ditolak'}
                          </span>
                        </td>
                        <td style={styles.td}>
                          <button
                            onClick={() => {
                              setSelectedPayment(payment);
                              setCatatan(payment.catatanAdmin || '');
                              setShowModal(true);
                            }}
                            style={styles.detailBtn}
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
        </main>
      </div>

      {/* Modal Detail Pembayaran */}
      {showModal && selectedPayment && (
        <div 
          style={styles.modalOverlay}
          onClick={() => !updating && setShowModal(false)}
        >
          <div 
            style={styles.modal}
            onClick={e => e.stopPropagation()}
          >
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Detail Pembayaran</h3>
              <button
                onClick={() => !updating && setShowModal(false)}
                style={styles.closeBtn}
                disabled={updating}
              >
                ✕
              </button>
            </div>

            <div style={styles.modalBody}>
              <div style={{ display: 'grid', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.25rem' }}>Penyewa</div>
                  <div style={{ fontWeight: 600 }}>{selectedPayment.userName}</div>
                  <div style={{ fontSize: '0.85rem', color: '#666' }}>{selectedPayment.userEmail}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.25rem' }}>Kost</div>
                  <div style={{ fontWeight: 600 }}>{selectedPayment.kostName}</div>
                </div>
                {selectedPayment.namaPengirim && (
                  <div>
                    <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.25rem' }}>Nama Pengirim</div>
                    <div style={{ fontWeight: 600 }}>{selectedPayment.namaPengirim}</div>
                  </div>
                )}
                {selectedPayment.namaRekening && (
                  <div>
                    <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.25rem' }}>Bank Tujuan</div>
                    <div style={{ fontWeight: 600 }}>{selectedPayment.namaRekening}</div>
                  </div>
                )}
                {selectedPayment.tanggalTransfer && (
                  <div>
                    <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.25rem' }}>Tanggal Transfer</div>
                    <div style={{ fontWeight: 600 }}>{formatDate(selectedPayment.tanggalTransfer)}</div>
                  </div>
                )}
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
                    alt="Bukti Transfer"
                    style={{ width: '100%', borderRadius: '8px', border: '2px solid #e5e7eb' }}
                  />
                </div>
              )}

              <div style={{ marginBottom: '1.5rem' }}>
                <span style={{ fontSize: '0.85rem', color: '#666' }}>Status: </span>
                <span style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '20px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  background: selectedPayment.status === 'pending' ? '#fef3c7' : 
                             selectedPayment.status === 'verified' ? '#d1fae5' : '#fee2e2',
                  color: selectedPayment.status === 'pending' ? '#92400e' :
                         selectedPayment.status === 'verified' ? '#065f46' : '#991b1b'
                }}>
                  {selectedPayment.status === 'pending' ? 'Menunggu Konfirmasi' : 
                   selectedPayment.status === 'verified' ? 'Dikonfirmasi' : 'Ditolak'}
                </span>
              </div>

              {selectedPayment.status === 'pending' && (
                <>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: '#666', marginBottom: '0.5rem' }}>
                      Catatan Admin (opsional)
                    </label>
                    <textarea
                      value={catatan}
                      onChange={(e) => setCatatan(e.target.value)}
                      placeholder="Tambahkan catatan jika perlu..."
                      rows={3}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '2px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '0.95rem',
                        fontFamily: 'inherit',
                        resize: 'vertical'
                      }}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                      onClick={() => updatePaymentStatus(selectedPayment.id, 'verified')}
                      disabled={updating}
                      style={{
                        flex: 1,
                        padding: '1rem',
                        background: updating ? '#9ca3af' : '#10b981',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontWeight: 600,
                        cursor: updating ? 'not-allowed' : 'pointer'
                      }}
                    >
                      {updating ? '⏳ Memproses...' : '✓ Konfirmasi'}
                    </button>
                    <button
                      onClick={() => updatePaymentStatus(selectedPayment.id, 'rejected')}
                      disabled={updating}
                      style={{
                        flex: 1,
                        padding: '1rem',
                        background: updating ? '#9ca3af' : '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontWeight: 600,
                        cursor: updating ? 'not-allowed' : 'pointer'
                      }}
                    >
                      {updating ? '⏳ Memproses...' : '✗ Tolak'}
                    </button>
                  </div>
                </>
              )}

              {selectedPayment.catatanAdmin && (
                <div style={{ marginTop: '1rem', padding: '1rem', background: '#f9fafb', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.25rem' }}>Catatan Admin:</div>
                  <div style={{ fontSize: '0.95rem' }}>{selectedPayment.catatanAdmin}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Styles sama seperti sebelumnya
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: '100vh',
    background: '#f5f5f5',
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
  header: {
    marginBottom: '2rem',
  },
  pageTitle: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '0.5rem',
  },
  pageSubtitle: {
    fontSize: '1rem',
    color: '#666',
  },
  spinner: {
    width: '50px',
    height: '50px',
    border: '5px solid #e5e7eb',
    borderTop: '5px solid #2563eb',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    margin: '0 auto',
  },
  paymentSection: {
    background: 'white',
    borderRadius: '12px',
    padding: '2rem',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  paymentHeader: {
    marginBottom: '2rem',
  },
  filterButtons: {
    display: 'flex',
    gap: '0.5rem',
    flexWrap: 'wrap',
  },
  filterBtn: {
    padding: '0.75rem 1.25rem',
    border: 'none',
    borderRadius: '8px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.3s',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  tableHeader: {
    background: '#f9fafb',
  },
  th: {
    padding: '1rem',
    textAlign: 'left',
    fontSize: '0.85rem',
    fontWeight: 600,
    color: '#666',
    textTransform: 'uppercase',
    borderBottom: '2px solid #e5e7eb',
  },
  tableRow: {
    borderBottom: '1px solid #e5e7eb',
  },
  td: {
    padding: '1rem',
    fontSize: '0.9rem',
  },
  detailBtn: {
    padding: '0.5rem 1rem',
    background: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  modalOverlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '1rem',
  },
  modal: {
    background: 'white',
    borderRadius: '12px',
    maxWidth: '600px',
    width: '100%',
    maxHeight: '90vh',
    overflow: 'auto',
  },
  modalHeader: {
    padding: '1.5rem',
    borderBottom: '1px solid #e5e7eb',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    margin: 0,
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    fontSize: '1.5rem',
    cursor: 'pointer',
  },
  modalBody: {
    padding: '1.5rem',
  },
};